from fastapi import APIRouter
from pydantic import BaseModel
from knowledge.retriever import KnowledgeRetriever
from knowledge.indexer import KnowledgeIndexer

router = APIRouter()
retriever = KnowledgeRetriever()
indexer = KnowledgeIndexer()


class SearchQuery(BaseModel):
    query: str
    top_k: int = 5


@router.post("/search")
async def search_knowledge(payload: SearchQuery):
    res = await retriever.retrieve(query=payload.query, top_k=payload.top_k)
    return {
        "retrieval_score": res.retrieval_score,
        "fallback_triggered": res.fallback_triggered,
        "citations": res.citations,
        "chunks": [{"heading": c.heading, "category": c.category, "text": c.text} for c in res.chunks]
    }


@router.post("/reindex")
async def reindex_knowledge():
    count = await indexer.index_all()
    return {"status": "success", "indexed_chunks": count}
