"""
Memory Manager — Handles 4-layer memory system persistence and retrieval.
"""
import logging
from typing import Dict, List, Optional
from sqlalchemy import select
from database.db import AsyncSessionLocal
from database.models import Conversation, Message, TradingSession

logger = logging.getLogger(__name__)


class MemoryManager:
    async def get_conversation_history(self, conversation_id: str, limit: int = 10) -> List[Dict]:
        """Layer 2: Conversation Memory retrieval."""
        async with AsyncSessionLocal() as session:
            stmt = (
                select(Message)
                .where(Message.conversation_id == conversation_id)
                .order_by(Message.created_at.desc())
                .limit(limit)
            )
            result = await session.execute(stmt)
            messages = list(result.scalars().all())
            messages.reverse()
            return [{"role": m.role, "content": m.content} for m in messages]

    async def save_message(
        self,
        conversation_id: str,
        user_message: str,
        assistant_response: str,
        intent: str,
        citations: list,
        retrieval_score: float,
        latency_ms: int,
        tokens_used: int,
    ):
        """Saves turn to Layer 2 Conversation Memory."""
        async with AsyncSessionLocal() as session:
            user_msg = Message(
                conversation_id=conversation_id,
                role="user",
                content=user_message,
                intent=intent,
            )
            assistant_msg = Message(
                conversation_id=conversation_id,
                role="assistant",
                content=assistant_response,
                intent=intent,
                citations=citations,
                retrieval_score=retrieval_score,
                latency_ms=latency_ms,
                tokens_used=tokens_used,
            )
            session.add(user_msg)
            session.add(assistant_msg)
            await session.commit()

    async def get_session_state(self, user_id: str) -> Dict:
        """Layer 3: Trading Session Memory retrieval."""
        async with AsyncSessionLocal() as session:
            stmt = (
                select(TradingSession)
                .where(TradingSession.user_id == user_id)
                .order_by(TradingSession.created_at.desc())
                .limit(1)
            )
            result = await session.execute(stmt)
            ts = result.scalar_one_or_none()
            if not ts:
                return {}
            return {
                "symbol": ts.symbol,
                "htf_bias": ts.htf_bias,
                "session_type": ts.session_type,
                "checklist": ts.checklist,
                "mistakes": ts.mistakes,
            }

    async def update_session(self, user_id: str, symbol: Optional[str], htf_bias: Optional[str], checklist: Optional[dict]):
        """Layer 3: Trading Session Memory update."""
        async with AsyncSessionLocal() as session:
            stmt = (
                select(TradingSession)
                .where(TradingSession.user_id == user_id)
                .order_by(TradingSession.created_at.desc())
                .limit(1)
            )
            result = await session.execute(stmt)
            ts = result.scalar_one_or_none()
            if not ts:
                ts = TradingSession(user_id=user_id, symbol=symbol, htf_bias=htf_bias, checklist=checklist or {})
                session.add(ts)
            else:
                if symbol:
                    ts.symbol = symbol
                if htf_bias:
                    ts.htf_bias = htf_bias
                if checklist:
                    ts.checklist = checklist
            await session.commit()
