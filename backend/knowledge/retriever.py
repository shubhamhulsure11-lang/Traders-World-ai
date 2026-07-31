"""
Knowledge Retriever — Hybrid BM25 + Vector search with RRF fusion and Gemini reranking.
"""
import logging
import math
import os
import hashlib
from dataclasses import dataclass, field
from typing import Optional

from rank_bm25 import BM25Okapi
from config import get_settings
from knowledge.chroma_client import get_chroma_collection

logger = logging.getLogger(__name__)
settings = get_settings()

CATEGORY_BOOSTS = {
    "live_analysis":    {"strategy": 1.5, "rules": 1.5},
    "teaching":         {"glossary": 1.5, "strategy": 1.5},
    "journal_review":   {"psychology": 1.5, "rules": 1.5},
    "backtest_query":   {"strategy": 1.5},
    "psychology":       {"psychology": 1.5, "rules": 1.3},
    "strategy_question":{"strategy": 1.5, "rules": 1.5},
    "checklist":        {"strategy": 1.5, "rules": 1.5},
}


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
        self._collection = None
        self._provider = None

    def _get_collection(self):
        if self._collection is None:
            self._collection = get_chroma_collection("traders_world_knowledge")
        return self._collection

    def _get_provider(self):
        if self._provider is None:
            from ai.providers.gemini import GeminiProvider
            self._provider = GeminiProvider()
        return self._provider

    def _fallback_embedding(self, text: str) -> list[float]:
        h = hashlib.sha256(text.encode('utf-8')).digest()
        vector = []
        for i in range(768):
            b = h[i % len(h)]
            val = ((b + i) % 256) / 128.0 - 1.0
            vector.append(val)
        return vector

    async def retrieve(self, query: str, intent=None, top_k: int = 5) -> RetrievalResult:
        """
        Hybrid search: BM25 + Vector, fused with RRF, then reranked.
        """
        collection = self._get_collection()
        if collection is None or collection.count() == 0:
            logger.warning("Knowledge retriever: ChromaDB empty or unavailable")
            return RetrievalResult(fallback_triggered=True)

        try:
            # ── Dense (vector) search ──────────────────────────────
            if settings.gemini_api_key:
                try:
                    query_embedding = await self._get_provider().embed_query(query)
                    if not query_embedding:
                        query_embedding = self._fallback_embedding(query)
                except Exception:
                    query_embedding = self._fallback_embedding(query)
            else:
                query_embedding = self._fallback_embedding(query)

            vector_results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(20, max(top_k * 4, collection.count())),
                include=["documents", "metadatas", "distances"],
            )

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

            if not vector_ranked:
                return RetrievalResult(fallback_triggered=True)

            # ── BM25 (keyword) search ─────────────────────────────
            bm25_ranked = self._bm25_search(query, vector_ranked)

            # ── RRF Fusion ────────────────────────────────────────
            fused = self._rrf_fusion(vector_ranked, bm25_ranked)

            # ── Category boosting ─────────────────────────────────
            intent_key = intent.intent if hasattr(intent, "intent") else (intent if isinstance(intent, str) else None)
            if intent_key and intent_key in CATEGORY_BOOSTS:
                boosts = CATEGORY_BOOSTS[intent_key]
                for item in fused:
                    cat = item["metadata"].get("category", "")
                    if cat in boosts:
                        item["rrf_score"] *= boosts[cat]

            fused.sort(key=lambda x: x["rrf_score"], reverse=True)
            candidates = fused[:top_k]

            if not candidates:
                return RetrievalResult(fallback_triggered=True)

            # ── Reranking ─────────────────────────────────────────
            reranked = await self._rerank(query, candidates)

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
                    "relevance_score": round(item.get("rerank_score", item["rrf_score"]), 3),
                })

            avg_score = sum(c.score for c in chunks) / len(chunks) if chunks else 0.0

            return RetrievalResult(
                chunks=chunks,
                citations=citations,
                retrieval_score=round(avg_score, 3),
                fallback_triggered=avg_score < 0.2,
            )

        except Exception as e:
            logger.error(f"Retrieval error: {e}")
            return RetrievalResult(fallback_triggered=True)

    def _bm25_search(self, query: str, vector_docs: list) -> list:
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
        if not candidates or not settings.gemini_api_key:
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
                item = dict(candidate)
                item["rerank_score"] = float(score)
                reranked.append(item)

            reranked.sort(key=lambda x: x["rerank_score"], reverse=True)
            return reranked

        except Exception as e:
            logger.warning(f"Reranker failed, using RRF scores: {e}")
            return candidates
