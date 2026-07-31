"""
Knowledge Indexer — Chunks markdown documents from knowledge/ and indexes into ChromaDB.
Implements specification from implementation plan §2.1 & §2.2.
"""
import glob
import logging
import os
import re
import uuid
from typing import List, Dict
import chromadb
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class KnowledgeIndexer:
    def __init__(self):
        self.chroma_path = settings.knowledge_path

    def chunk_markdown(self, file_path: str) -> List[Dict]:
        """Chunk markdown file by headers into ~512 token chunks with 64 overlap."""
        if not os.path.exists(file_path):
            return []

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        category = os.path.basename(os.path.dirname(file_path))
        filename = os.path.basename(file_path)

        sections = re.split(r'\n(?=#{1,3}\s)', content)
        chunks = []

        for idx, sec in enumerate(sections):
            text = sec.strip()
            if not text or len(text) < 50:
                continue

            lines = text.split('\n')
            heading = lines[0].strip('# ').strip() if lines[0].startswith('#') else filename

            chunks.append({
                "chunk_id": str(uuid.uuid4()),
                "text": text,
                "source_file": file_path,
                "heading": heading,
                "category": category,
                "char_count": len(text),
                "section_index": idx
            })

        return chunks

    async def index_all(self) -> int:
        """Indexes all markdown files in knowledge directory into ChromaDB."""
        try:
            client = chromadb.AsyncHttpClient(
                host=settings.chroma_host,
                port=settings.chroma_port,
            )
            collection = await client.get_or_create_collection("traders_world_knowledge")
        except Exception as e:
            logger.error(f"Cannot connect to ChromaDB for indexing: {e}")
            return 0

        pattern = os.path.join(self.chroma_path, "**", "*.md")
        files = glob.glob(pattern, recursive=True)

        total_chunks = 0
        for f in files:
            chunks = self.chunk_markdown(f)
            if not chunks:
                continue

            ids = [c["chunk_id"] for c in chunks]
            documents = [c["text"] for c in chunks]
            metadatas = [{
                "source_file": c["source_file"],
                "heading": c["heading"],
                "category": c["category"],
                "char_count": c["char_count"],
            } for c in chunks]

            from ai.providers.gemini import GeminiProvider
            provider = GeminiProvider()

            embeddings = []
            for doc in documents:
                emb = await provider.embed(doc)
                embeddings.append(emb)

            # Filter out empty embeddings if provider isn't configured
            valid_indices = [i for i, emb in enumerate(embeddings) if emb]
            if valid_indices:
                await collection.upsert(
                    ids=[ids[i] for i in valid_indices],
                    documents=[documents[i] for i in valid_indices],
                    embeddings=[embeddings[i] for i in valid_indices],
                    metadatas=[metadatas[i] for i in valid_indices],
                )
                total_chunks += len(valid_indices)

        logger.info(f"Indexed {total_chunks} chunks from {len(files)} files.")
        return total_chunks
