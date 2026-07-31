from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict
from ai.orchestrator import AIOrchestrator, OrchestratorRequest

router = APIRouter()
orchestrator = AIOrchestrator()


class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: str = "default_conv"
    user_id: str = "default_user"
    market_context: Optional[Dict] = None
    stream: bool = False


@router.post("/chat")
async def chat_endpoint(payload: ChatMessageRequest):
    req = OrchestratorRequest(
        user_message=payload.message,
        conversation_id=payload.conversation_id,
        user_id=payload.user_id,
        market_context=payload.market_context,
    )

    if payload.stream:
        return StreamingResponse(
            orchestrator.stream(req),
            media_type="text/event-stream"
        )

    res = await orchestrator.process(req)
    return {
        "text": res.text,
        "intent": res.intent,
        "citations": res.citations,
        "checklist": res.checklist,
        "retrieval_score": res.retrieval_score,
        "latency_ms": res.latency_ms,
        "tokens_used": res.tokens_used,
    }
