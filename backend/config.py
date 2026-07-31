import logging
import os
from functools import lru_cache
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # AI Provider
    gemini_api_key: str = ""

    # Database
    database_url: str = "sqlite+aiosqlite:///./traders_world.db"

    # ChromaDB
    chroma_host: str = "localhost"
    chroma_port: int = 8000

    # Paths
    knowledge_path: str = "./knowledge"
    prompts_path: str = "./prompts"

    # Environment
    env: str = "development"

    # Security
    jwt_secret: str = "traders_world_ai_super_secret_jwt_key_2026_smc"
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    def validate_security(self):
        if self.env == "production":
            if self.jwt_secret == "change-in-production":
                logger.error("DANGER: jwt_secret must be changed in production!")
            if not self.gemini_api_key:
                logger.warning("WARNING: gemini_api_key is empty in production environment!")

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    s = Settings()
    s.validate_security()
    return s
