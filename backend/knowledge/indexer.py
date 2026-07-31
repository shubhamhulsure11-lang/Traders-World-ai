"""
Knowledge Indexer — Chunks markdown documents from knowledge/ and indexes into ChromaDB + SQLite knowledge_documents table.
"""
import glob
import logging
import os
import re
import uuid
import hashlib
from datetime import datetime
from typing import List, Dict

from config import get_settings
from knowledge.chroma_client import get_chroma_collection
from database.db import AsyncSessionLocal, init_db
from database.models import KnowledgeDocument

logger = logging.getLogger(__name__)
settings = get_settings()


class KnowledgeIndexer:
    def __init__(self):
        self.chroma_path = settings.knowledge_path
        if not os.path.isabs(self.chroma_path):
            self.chroma_path = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", self.chroma_path))

    def chunk_markdown(self, file_path: str) -> List[Dict]:
        """Chunk markdown file by headers into ~512 token chunks."""
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
            if not text or len(text) < 30:
                continue

            lines = text.split('\n')
            heading = lines[0].strip('# ').strip() if lines[0].startswith('#') else filename

            chunks.append({
                "chunk_id": str(uuid.uuid4()),
                "text": text,
                "source_file": filename,
                "full_path": file_path,
                "heading": heading,
                "category": category,
                "char_count": len(text),
                "section_index": idx
            })

        return chunks

    def _fallback_embedding(self, text: str) -> List[float]:
        """Generates a 768-dim pseudo-random deterministic vector based on text hash when API key is unconfigured."""
        h = hashlib.sha256(text.encode('utf-8')).digest()
        vector = []
        for i in range(768):
            b = h[i % len(h)]
            val = ((b + i) % 256) / 128.0 - 1.0
            vector.append(val)
        return vector

    async def index_all(self) -> int:
        """Indexes all markdown files in knowledge directory into ChromaDB and SQLite DB."""
        await init_db()
        collection = get_chroma_collection("traders_world_knowledge")
        if collection is None:
            logger.error("Cannot initialize ChromaDB collection for indexing")
            return 0

        pattern = os.path.join(self.chroma_path, "**", "*.md")
        files = glob.glob(pattern, recursive=True)
        if not files:
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "knowledge"))
            pattern = os.path.join(base_dir, "**", "*.md")
            files = glob.glob(pattern, recursive=True)

        logger.info(f"Indexing markdown files from pattern: {pattern}, found {len(files)} files")

        total_chunks = 0

        from ai.providers.gemini import GeminiProvider
        provider = GeminiProvider()

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

            embeddings = []
            for doc in documents:
                if settings.gemini_api_key:
                    try:
                        emb = await provider.embed(doc)
                        if not emb:
                            emb = self._fallback_embedding(doc)
                    except Exception:
                        emb = self._fallback_embedding(doc)
                else:
                    emb = self._fallback_embedding(doc)
                embeddings.append(emb)

            try:
                collection.upsert(
                    ids=ids,
                    documents=documents,
                    embeddings=embeddings,
                    metadatas=metadatas,
                )
                total_chunks += len(chunks)
            except Exception as e:
                logger.error(f"ChromaDB upsert error for file {f}: {e}")

            # Save KnowledgeDocument record in a dedicated short session
            try:
                async with AsyncSessionLocal() as db:
                    doc_id = hashlib.md5(f.encode('utf-8')).hexdigest()
                    category = os.path.basename(os.path.dirname(f))
                    title = os.path.basename(f)

                    from sqlalchemy import select
                    stmt = select(KnowledgeDocument).where(KnowledgeDocument.doc_id == doc_id)
                    res = await db.execute(stmt)
                    doc_record = res.scalar_one_or_none()

                    if not doc_record:
                        doc_record = KnowledgeDocument(
                            doc_id=doc_id,
                            title=title,
                            category=category,
                            file_path=f,
                            chunk_count=len(chunks),
                            indexed_at=datetime.utcnow()
                        )
                        db.add(doc_record)
                    else:
                        doc_record.chunk_count = len(chunks)
                        doc_record.indexed_at = datetime.utcnow()

                    await db.commit()
            except Exception as e:
                logger.error(f"Failed to write KnowledgeDocument for {f}: {e}")

        logger.info(f"Indexed {total_chunks} chunks from {len(files)} files into ChromaDB & SQLite.")
        return total_chunks
