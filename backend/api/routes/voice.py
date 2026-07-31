from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from ai.orchestrator import AIOrchestrator, OrchestratorRequest

router = APIRouter()
orchestrator = AIOrchestrator()


class VoiceRequest(BaseModel):
    user_message: str
    user_id: str = "default_user"
    conversation_id: str = "voice_session"
    mode: str = "coach"
    market_context: Optional[dict] = None


@router.get("/session")
async def get_voice_session():
    return {
        "status": "active",
        "engine": "WebSpeechAPI + Gemini Flash Orchestrator",
        "supported_modes": ["teacher", "coach", "analyst", "researcher"],
    }


@router.post("/process")
async def process_voice_turn(payload: VoiceRequest):
    req = OrchestratorRequest(
        user_message=payload.user_message,
        conversation_id=payload.conversation_id,
        user_id=payload.user_id,
        market_context=payload.market_context,
        voice_mode=True,
    )
    res = await orchestrator.process(req)
    return {
        "text": res.text,
        "intent": res.intent,
        "citations": res.citations,
        "latency_ms": res.latency_ms,
    }
