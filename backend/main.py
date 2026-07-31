"""
Traders World AI — FastAPI Application Entry Point
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import get_settings
from database.db import init_db
from api.routes import chat, voice, knowledge, strategy, journal, backtest, memory, health, analytics, auth

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    logger.info("🚀 Traders World AI starting up...")
    await init_db()
    logger.info("✅ Database initialized")
    logger.info("✅ All systems ready")
    yield
    logger.info("👋 Traders World AI shutting down...")


app = FastAPI(
    title="Traders World AI",
    description="AI Trading Copilot — Strategy-driven, never prediction-driven.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────────
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(chat.router, prefix="/api/v1", tags=["AI Chat"])
app.include_router(voice.router, prefix="/api/v1/voice", tags=["Voice"])
app.include_router(knowledge.router, prefix="/api/v1/knowledge", tags=["Knowledge"])
app.include_router(strategy.router, prefix="/api/v1/strategy", tags=["Strategy"])
app.include_router(journal.router, prefix="/api/v1/journal", tags=["Journal"])
app.include_router(backtest.router, prefix="/api/v1/backtests", tags=["Backtests"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(memory.router, prefix="/api/v1/memory", tags=["Memory"])


@app.get("/")
async def root():
    return {
        "name": "Traders World AI",
        "version": "1.0.0",
        "status": "operational",
        "message": "The AI never predicts. It only explains.",
    }
