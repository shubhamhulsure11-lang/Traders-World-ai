"""
Abstract base class for AI providers.
Implement this interface to add any provider (OpenAI, Anthropic, Ollama, etc.)
"""
from abc import ABC, abstractmethod
from typing import AsyncGenerator, Tuple


class BaseAIProvider(ABC):

    @abstractmethod
    async def generate(self, prompt: str | list, model: str = "flash") -> Tuple[str, int]:
        """Non-streaming generation. Returns (text, tokens_used)."""
        ...

    @abstractmethod
    async def stream(self, prompt: str | list, model: str = "flash") -> AsyncGenerator[str, None]:
        """Streaming generation — yields text chunks."""
        ...

    @abstractmethod
    async def embed(self, text: str) -> list[float]:
        """Generate embedding for a document chunk."""
        ...

    @abstractmethod
    async def embed_query(self, text: str) -> list[float]:
        """Generate embedding for a search query."""
        ...
