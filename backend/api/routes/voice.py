from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class VoiceSessionRequest(BaseModel):
    user_id: str = "default_user"
    mode: str = "coach"


@router.get("/session")
async def get_voice_session():
    return {"status": "active", "supported_modes": ["teacher", "coach", "analyst", "researcher"]}


@router.post("/speak")
async def voice_speak_endpoint(payload: VoiceSessionRequest):
    return {"status": "ready", "message": "Browser Web Speech API handle audio synthesis."}
