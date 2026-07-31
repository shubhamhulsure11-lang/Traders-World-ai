"""
Knowledge Retriever — Hybrid BM25 + Vector search with RRF fusion and Gemini reranking.
Implements the full RAG spec from implementation plan §2.
"""
import logging
import math
import os
from dataclasses import dataclass, field
from typing import Optional

import chromadb
from rank_bm25 import BM25Okapi

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Category boost weights by intent
CATEGORY_BOOSTS = {
    "live_analysis":    {"strategy": 1.5, "rule": 1.5},
    "teaching":         {"glossary": 1.5, "example": 1.5},
    "journal_review":   {"journal": 1.5, "psychology": 1.5},
    "backtest_query":   {"backtest": 1.5},
    "psychology":       {"psychology": 1.5, "rule": 1.3},
    "strategy_question":{"strategy": 1.5, "rule": 1.5},
    "checklist":        {"strategy": 1.5, "rule": 1.5},
}

# Reranker threshold — chunks scoring below this are dropped
RERANK_THRESHOLD = 0.35


@dataclass
class ChunkResult:
    chunk_id: str
    text: str
    source_file: str
    heading: str
    category: str
    score: float
    metadata: dict = field(default_factory=dict)


@dataclass
class RetrievalResult:
    chunks: list[ChunkResult] = field(default_factory=list)
    citations: list[dict] = field(default_factory=list)
    retrieval_score: float = 0.0
    fallback_triggered: bool = False


class KnowledgeRetriever:
    def __init__(self):
        self._chroma: Optional[chromadb.AsyncHttpClient] = None
        self._collection = None
        self._bm25_index = None
        self._bm25_docs = []
        self._provider = None

    async def _get_collection(self):
        if self._collection is None:
            try:
                client = chromadb.AsyncHttpClient(
                    host=settings.chroma_host,
                    port=settings.chroma_port,
                )
                self._collection = await client.get_or_create_collection(
                    name="traders_world_knowledge",
                    metadata={"hnsw:space": "cosine"},
                )
                logger.info("ChromaDB collection connected")
            except Exception as e:
                logger.warning(f"ChromaDB unavailable: {e}")
        return self._collection

    def _get_provider(self):
        if self._provider is None:
            from ai.providers.gemini import GeminiProvider
            self._provider = GeminiProvider()
        return self._provider

    async def retrieve(self, query: str, intent=None, top_k: int = 5) -> RetrievalResult:
        """
        Hybrid search: BM25 + Vector, fused with RRF, then reranked.
        """
        collection = await self._get_collection()
        if collection is None:
            logger.warning("Knowledge retriever: ChromaDB not available, returning empty")
            return RetrievalResult(fallback_triggered=True)

        try:
            # ── Dense (vector) search ──────────────────────────────
            query_embedding = await self._get_provider().embed_query(query)
            vector_results = await collection.query(
                query_embeddings=[query_embedding],
                n_results=min(20, top_k * 4),
                include=["documents", "metadatas", "distances"],
            )

            # Parse vector results into ranked list
            vector_ranked = []
            if vector_results["ids"] and vector_results["ids"][0]:
                for i, chunk_id in enumerate(vector_results["ids"][0]):
                    vector_ranked.append({
                        "chunk_id": chunk_id,
                        "text": vector_results["documents"][0][i],
                        "metadata": vector_results["metadatas"][0][i],
                        "distance": vector_results["distances"][0][i],
                        "vector_rank": i + 1,
                    })

            # ── BM25 (keyword) search ─────────────────────────────
            bm25_ranked = self._bm25_search(query, vector_ranked)

            # ── RRF Fusion ────────────────────────────────────────
            fused = self._rrf_fusion(vector_ranked, bm25_ranked)

            # ── Category boosting ─────────────────────────────────
            if intent and intent.intent in CATEGORY_BOOSTS:
                boosts = CATEGORY_BOOSTS[intent.intent]
                for item in fused:
                    cat = item["metadata"].get("category", "")
                    if cat in boosts:
                        item["rrf_score"] *= boosts[cat]

            # Sort by final score
            fused.sort(key=lambda x: x["rrf_score"], reverse=True)
            candidates = fused[:top_k]

            if not candidates:
                return RetrievalResult(fallback_triggered=True)

            # ── Reranking ─────────────────────────────────────────
            reranked = await self._rerank(query, candidates)

            # Build final result
            chunks = []
            citations = []
            for item in reranked:
                chunk = ChunkResult(
                    chunk_id=item["chunk_id"],
                    text=item["text"],
                    source_file=item["metadata"].get("source_file", ""),
                    heading=item["metadata"].get("heading", ""),
                    category=item["metadata"].get("category", ""),
                    score=item.get("rerank_score", item["rrf_score"]),
                    metadata=item["metadata"],
                )
                chunks.append(chunk)
                citations.append({
                    "label": f"{item['metadata'].get('category', '').title()}: {item['metadata'].get('heading', '')}",
                    "source": item["metadata"].get("source_file", ""),
                    "section": item["metadata"].get("heading", ""),
                    "relevance_score": round(item.get("rerank_score", 0.5), 3),
                })

            avg_score = sum(c.score for c in chunks) / len(chunks) if chunks else 0.0

            return RetrievalResult(
                chunks=chunks,
                citations=citations,
                retrieval_score=avg_score,
                fallback_triggered=avg_score < 0.3,
            )

        except Exception as e:
            logger.error(f"Retrieval error: {e}")
            return RetrievalResult(fallback_triggered=True)

    def _bm25_search(self, query: str, vector_docs: list) -> list:
        """BM25 keyword search over the same document set."""
        if not vector_docs:
            return []
        tokenized_corpus = [doc["text"].lower().split() for doc in vector_docs]
        bm25 = BM25Okapi(tokenized_corpus)
        scores = bm25.get_scores(query.lower().split())
        ranked = sorted(
            [(i, s) for i, s in enumerate(scores)],
            key=lambda x: x[1],
            reverse=True,
        )
        result = []
        for rank, (idx, score) in enumerate(ranked):
            item = dict(vector_docs[idx])
            item["bm25_rank"] = rank + 1
            item["bm25_score"] = score
            result.append(item)
        return result

    def _rrf_fusion(self, vector_ranked: list, bm25_ranked: list, k: int = 60) -> list:
        """Reciprocal Rank Fusion."""
        scores = {}
        chunk_map = {}

        for rank, item in enumerate(vector_ranked):
            cid = item["chunk_id"]
            scores[cid] = scores.get(cid, 0) + 1 / (k + rank + 1)
            chunk_map[cid] = item

        for rank, item in enumerate(bm25_ranked):
            cid = item["chunk_id"]
            scores[cid] = scores.get(cid, 0) + 1 / (k + rank + 1)
            if cid not in chunk_map:
                chunk_map[cid] = item

        result = []
        for cid, score in scores.items():
            item = dict(chunk_map[cid])
            item["rrf_score"] = score
            result.append(item)

        return result

    async def _rerank(self, query: str, candidates: list) -> list:
        """
        Gemini reranker — scores each candidate 0-1 against the query.
        Drops anything below RERANK_THRESHOLD.
        """
        if not candidates:
            return candidates

        try:
            rerank_prompt = f"""You are a relevance scorer for a trading AI knowledge base.

Query: "{query}"

Score each document chunk's relevance to the query on a scale of 0.0 to 1.0.
Return ONLY a JSON array of scores in the same order as the documents.
Example: [0.92, 0.45, 0.78, 0.31, 0.85]

Documents:
{chr(10).join([f'{i+1}. {c["text"][:200]}' for i, c in enumerate(candidates)])}

Scores:"""

            response, _ = await self._get_provider().generate(rerank_prompt, model="flash")
            text = response.strip()
            if "[" in text:
                text = text[text.index("["):text.rindex("]") + 1]
            import json
            scores = json.loads(text)

            reranked = []
            for i, candidate in enumerate(candidates):
                score = scores[i] if i < len(scores) else 0.5
                if score >= RERANK_THRESHOLD:
                    item = dict(candidate)
                    item["rerank_score"] = score
                    reranked.append(item)

            reranked.sort(key=lambda x: x["rerank_score"], reverse=True)
            return reranked

        except Exception as e:
            logger.warning(f"Reranker failed, using RRF scores: {e}")
            return candidates
