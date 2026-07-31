from fastapi import APIRouter
from pydantic import BaseModel
from memory.manager import MemoryManager

router = APIRouter()
memory = MemoryManager()


@router.get("/session/{user_id}")
async def get_session_memory(user_id: str):
    state = await memory.get_session_state(user_id)
    return {"user_id": user_id, "session_state": state}
