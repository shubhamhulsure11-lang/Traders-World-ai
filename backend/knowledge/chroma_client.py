"""
ChromaDB Client Helper — Supports Docker HTTP client with automatic fallback to local PersistentClient.
"""
import logging
import os
import chromadb
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def get_chroma_collection(collection_name: str = "traders_world_knowledge"):
    """
    Returns a ChromaDB collection.
    First tries PersistentClient (local storage), or HTTP Client if host is configured.
    """
    db_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "chroma_db")
    os.makedirs(db_dir, exist_ok=True)

    # 1. Try local PersistentClient first (fast, reliable, independent of docker)
    try:
        client = chromadb.PersistentClient(path=db_dir)
        collection = client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(f"Connected to local ChromaDB PersistentClient at {db_dir}")
        return collection
    except Exception as e:
        logger.warning(f"PersistentClient failed, trying HttpClient: {e}")

    # 2. Try HttpClient if persistent client fails
    try:
        client = chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)
        collection = client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(f"Connected to remote ChromaDB HttpClient at {settings.chroma_host}:{settings.chroma_port}")
        return collection
    except Exception as e:
        logger.error(f"Failed to connect to ChromaDB via HttpClient: {e}")
        return None
