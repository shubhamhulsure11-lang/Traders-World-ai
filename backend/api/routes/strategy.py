from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional
from strategy.engine import StrategyEngine

router = APIRouter()
engine = StrategyEngine()


class StrategyEvalRequest(BaseModel):
    market_context: Dict


@router.post("/evaluate")
async def evaluate_strategy(payload: StrategyEvalRequest):
    val = engine.validate(payload.market_context)
    return {
        "verdict": val.verdict,
        "confidence": val.confidence,
        "checklist": val.checklist,
        "rules_satisfied": val.rules_satisfied,
        "rules_missing": val.rules_missing,
    }
