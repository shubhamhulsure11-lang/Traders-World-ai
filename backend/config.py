from pydantic_settings import BaseSettings
from functools import lru_cache
import os


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
    jwt_secret: str = "change-in-production"
    allowed_origins: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
