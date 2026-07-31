"""
Google Gemini AI Provider.
Adapter pattern — swap to any other provider by implementing base.py interface.
"""
import logging
from typing import AsyncGenerator, Optional, Tuple

import google.generativeai as genai

from config import get_settings
from ai.providers.base import BaseAIProvider

logger = logging.getLogger(__name__)

settings = get_settings()

MODELS = {
    "flash": "gemini-1.5-flash",
    "pro": "gemini-1.5-pro",
    "embedding": "models/text-embedding-004",
}

GENERATION_CONFIG = {
    "temperature": 0.3,      # Low temperature = more consistent, less creative
    "top_p": 0.8,
    "top_k": 40,
    "max_output_tokens": 4096,
}


class GeminiProvider(BaseAIProvider):
    def __init__(self):
        if not settings.gemini_api_key:
            logger.warning("GEMINI_API_KEY not set — AI features will be limited")
        else:
            genai.configure(api_key=settings.gemini_api_key)

        self._flash = None
        self._pro = None

    def _get_model(self, model: str = "flash"):
        model_name = MODELS.get(model, MODELS["flash"])
        return genai.GenerativeModel(
            model_name=model_name,
            generation_config=GENERATION_CONFIG,
        )

    async def generate(
        self, prompt: str | list, model: str = "flash"
    ) -> Tuple[str, int]:
        """Non-streaming generation. Returns (text, tokens_used)."""
        try:
            m = self._get_model(model)
            if isinstance(prompt, str):
                response = await m.generate_content_async(prompt)
            else:
                response = await m.generate_content_async(prompt)

            text = response.text
            tokens = response.usage_metadata.total_token_count if hasattr(response, "usage_metadata") else 0
            return text, tokens
        except Exception as e:
            logger.error(f"Gemini generate error: {e}")
            raise

    async def stream(self, prompt: str | list, model: str = "flash") -> AsyncGenerator[str, None]:
        """Streaming generation — yields text chunks."""
        try:
            m = self._get_model(model)
            response = await m.generate_content_async(prompt, stream=True)
            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f"Gemini stream error: {e}")
            yield f"\n\n[Error communicating with AI: {str(e)}]"

    async def embed(self, text: str) -> list[float]:
        """Generate embedding for a text chunk."""
        try:
            result = genai.embed_content(
                model=MODELS["embedding"],
                content=text,
                task_type="retrieval_document",
            )
            return result["embedding"]
        except Exception as e:
            logger.error(f"Gemini embed error: {e}")
            return []

    async def embed_query(self, text: str) -> list[float]:
        """Generate embedding for a search query."""
        try:
            result = genai.embed_content(
                model=MODELS["embedding"],
                content=text,
                task_type="retrieval_query",
            )
            return result["embedding"]
        except Exception as e:
            logger.error(f"Gemini embed_query error: {e}")
            return []
