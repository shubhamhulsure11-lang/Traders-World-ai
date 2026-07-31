import pytest
from knowledge.indexer import KnowledgeIndexer
from knowledge.retriever import KnowledgeRetriever


def test_markdown_chunker():
    indexer = KnowledgeIndexer()
    chunks = indexer.chunk_markdown("../knowledge/rules/rule_01.md")
    assert len(chunks) > 0
    assert chunks[0]["category"] == "rules"
    assert "source_file" in chunks[0]


@pytest.mark.asyncio
async def test_retriever_fallback_vector():
    retriever = KnowledgeRetriever()
    v1 = retriever._fallback_embedding("Higher Timeframe Bias")
    v2 = retriever._fallback_embedding("Higher Timeframe Bias")
    assert len(v1) == 768
    assert v1 == v2  # deterministic hashing
