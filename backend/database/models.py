"""
Complete SQLAlchemy models — all 9 entities from the implementation plan §5.2
"""
import uuid
from datetime import datetime, date
from typing import Optional

from sqlalchemy import (
    String, Text, Float, Integer, Boolean, DateTime, Date,
    ForeignKey, JSON, Enum as SAEnum, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.sqlite import TEXT

from database.db import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


# ─────────────────────────────────────────────────────────────────
# User
# ─────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, nullable=True)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(
        SAEnum("founder", "premium", "standard", name="user_role"),
        default="founder"
    )
    preferences: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=datetime.utcnow, nullable=True)

    # Relationships
    conversations: Mapped[list["Conversation"]] = relationship(back_populates="user")
    trading_sessions: Mapped[list["TradingSession"]] = relationship(back_populates="user")
    trades: Mapped[list["Trade"]] = relationship(back_populates="user")
    backtests: Mapped[list["Backtest"]] = relationship(back_populates="user")


# ─────────────────────────────────────────────────────────────────
# Conversation
# ─────────────────────────────────────────────────────────────────
class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mode: Mapped[str] = mapped_column(
        SAEnum("text", "voice", name="conv_mode"), default="text"
    )
    session_state: Mapped[dict] = mapped_column(JSON, default=dict)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    archived_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship(back_populates="conversations")
    messages: Mapped[list["Message"]] = relationship(back_populates="conversation", order_by="Message.created_at")


# ─────────────────────────────────────────────────────────────────
# Message
# ─────────────────────────────────────────────────────────────────
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    conversation_id: Mapped[str] = mapped_column(String(36), ForeignKey("conversations.id"))
    role: Mapped[str] = mapped_column(
        SAEnum("user", "assistant", "system", name="msg_role")
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    intent: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    citations: Mapped[list] = mapped_column(JSON, default=list)
    retrieval_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    latency_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    tokens_used: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    conversation: Mapped["Conversation"] = relationship(back_populates="messages")
    eval_logs: Mapped[list["AIEvaluationLog"]] = relationship(back_populates="message")


# ─────────────────────────────────────────────────────────────────
# TradingSession
# ─────────────────────────────────────────────────────────────────
class TradingSession(Base):
    __tablename__ = "trading_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    date: Mapped[date] = mapped_column(Date, nullable=False, default=datetime.utcnow().date)
    symbol: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    session_type: Mapped[Optional[str]] = mapped_column(
        SAEnum("london", "newyork", "asian", "other", name="session_type"), nullable=True
    )
    htf_bias: Mapped[Optional[str]] = mapped_column(
        SAEnum("bullish", "bearish", "ranging", "unknown", name="htf_bias"), nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    mistakes: Mapped[list] = mapped_column(JSON, default=list)
    checklist: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="trading_sessions")
    trades: Mapped[list["Trade"]] = relationship(back_populates="session")


# ─────────────────────────────────────────────────────────────────
# Trade
# ─────────────────────────────────────────────────────────────────
class Trade(Base):
    __tablename__ = "trades"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    session_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("trading_sessions.id"), nullable=True)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    direction: Mapped[Optional[str]] = mapped_column(
        SAEnum("long", "short", name="trade_direction"), nullable=True
    )
    session_type: Mapped[Optional[str]] = mapped_column(
        SAEnum("london", "newyork", "asian", "other", name="trade_session"), nullable=True
    )
    htf_bias: Mapped[Optional[str]] = mapped_column(
        SAEnum("bullish", "bearish", "ranging", name="trade_htf_bias"), nullable=True
    )
    ltf_confirmation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    entry_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    stop_loss: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    take_profit: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    close_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    risk_percent: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    r_multiple: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    result: Mapped[Optional[str]] = mapped_column(
        SAEnum("win", "loss", "breakeven", "open", name="trade_result"), nullable=True
    )
    setup_quality: Mapped[Optional[str]] = mapped_column(
        SAEnum("aplus", "b", "c", "fomo", "forced", name="setup_quality"), nullable=True
    )
    rules_followed: Mapped[list] = mapped_column(JSON, default=list)
    rules_broken: Mapped[list] = mapped_column(JSON, default=list)
    emotions: Mapped[list] = mapped_column(JSON, default=list)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    lessons: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    entry_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="trades")
    session: Mapped[Optional["TradingSession"]] = relationship(back_populates="trades")
    screenshots: Mapped[list["TradeScreenshot"]] = relationship(back_populates="trade")


# ─────────────────────────────────────────────────────────────────
# TradeScreenshot
# ─────────────────────────────────────────────────────────────────
class TradeScreenshot(Base):
    __tablename__ = "trade_screenshots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    trade_id: Mapped[str] = mapped_column(String(36), ForeignKey("trades.id"))
    file_path: Mapped[str] = mapped_column(String(500))
    type: Mapped[str] = mapped_column(
        SAEnum("before", "after", "annotated", name="screenshot_type"), default="before"
    )
    timeframe: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    trade: Mapped["Trade"] = relationship(back_populates="screenshots")


# ─────────────────────────────────────────────────────────────────
# Backtest
# ─────────────────────────────────────────────────────────────────
class Backtest(Base):
    __tablename__ = "backtests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    strategy_name: Mapped[str] = mapped_column(String(100), default="SMC Methodology")
    period_start: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    period_end: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    sample_size: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    win_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    avg_rr: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    profit_factor: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    max_drawdown: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    expectancy: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    session_stats: Mapped[dict] = mapped_column(JSON, default=dict)
    setup_stats: Mapped[dict] = mapped_column(JSON, default=dict)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="backtests")


# ─────────────────────────────────────────────────────────────────
# KnowledgeDocument
# ─────────────────────────────────────────────────────────────────
class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    doc_id: Mapped[str] = mapped_column(String(100), unique=True)
    title: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(50))
    file_path: Mapped[str] = mapped_column(String(500))
    version: Mapped[str] = mapped_column(String(20), default="1.0.0")
    author: Mapped[str] = mapped_column(String(100), default="founder")
    indexed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, onupdate=datetime.utcnow, nullable=True)


# ─────────────────────────────────────────────────────────────────
# AIEvaluationLog
# ─────────────────────────────────────────────────────────────────
class AIEvaluationLog(Base):
    __tablename__ = "ai_evaluation_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    message_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("messages.id"), nullable=True)
    benchmark_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    intent_detected: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    retrieval_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    citations_used: Mapped[int] = mapped_column(Integer, default=0)
    latency_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    tokens_used: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    hallucination_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    human_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    message: Mapped[Optional["Message"]] = relationship(back_populates="eval_logs")
