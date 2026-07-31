import os
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy import select, or_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db
from database.models import Trade, TradeScreenshot

router = APIRouter()


class TradeCreate(BaseModel):
    user_id: str = "default_user"
    symbol: str
    direction: str  # long | short
    entry_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    close_price: Optional[float] = None
    result: Optional[str] = "open"  # win | loss | breakeven | open
    setup_quality: Optional[str] = "aplus"  # aplus | b | c | fomo
    notes: Optional[str] = None
    r_multiple: Optional[float] = None


class TradeUpdate(BaseModel):
    symbol: Optional[str] = None
    direction: Optional[str] = None
    entry_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    close_price: Optional[float] = None
    result: Optional[str] = None
    setup_quality: Optional[str] = None
    notes: Optional[str] = None
    r_multiple: Optional[float] = None


@router.get("/")
async def list_journals(
    search: Optional[str] = None,
    direction: Optional[str] = None,
    setup_quality: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Trade).order_by(Trade.created_at.desc())
    if search:
        stmt = stmt.where(or_(Trade.symbol.ilike(f"%{search}%"), Trade.notes.ilike(f"%{search}%")))
    if direction:
        stmt = stmt.where(Trade.direction == direction.lower())
    if setup_quality:
        stmt = stmt.where(Trade.setup_quality == setup_quality.lower())

    res = await db.execute(stmt)
    trades = res.scalars().all()
    return [
        {
            "id": t.id,
            "user_id": t.user_id,
            "symbol": t.symbol,
            "direction": t.direction,
            "entry_price": t.entry_price,
            "stop_loss": t.stop_loss,
            "take_profit": t.take_profit,
            "close_price": t.close_price,
            "result": t.result,
            "setup_quality": t.setup_quality,
            "notes": t.notes,
            "r_multiple": t.r_multiple,
            "lessons": t.lessons,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in trades
    ]


@router.get("/{trade_id}")
async def get_journal(trade_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Trade).where(Trade.id == trade_id)
    res = await db.execute(stmt)
    trade = res.scalar_one_or_none()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return {
        "id": trade.id,
        "symbol": trade.symbol,
        "direction": trade.direction,
        "entry_price": trade.entry_price,
        "stop_loss": trade.stop_loss,
        "take_profit": trade.take_profit,
        "close_price": trade.close_price,
        "result": trade.result,
        "setup_quality": trade.setup_quality,
        "notes": trade.notes,
        "r_multiple": trade.r_multiple,
        "lessons": trade.lessons,
        "created_at": trade.created_at.isoformat() if trade.created_at else None,
    }


@router.post("/")
async def create_journal(payload: TradeCreate, db: AsyncSession = Depends(get_db)):
    r_mult = payload.r_multiple
    if r_mult is None and payload.entry_price and payload.stop_loss and payload.take_profit:
        risk = abs(payload.entry_price - payload.stop_loss)
        reward = abs(payload.take_profit - payload.entry_price)
        r_mult = round(reward / risk, 2) if risk > 0 else 0.0

    trade = Trade(
        user_id=payload.user_id,
        symbol=payload.symbol.upper(),
        direction=payload.direction.lower(),
        entry_price=payload.entry_price,
        stop_loss=payload.stop_loss,
        take_profit=payload.take_profit,
        close_price=payload.close_price,
        result=payload.result.lower() if payload.result else "open",
        setup_quality=payload.setup_quality.lower() if payload.setup_quality else "aplus",
        notes=payload.notes,
        r_multiple=r_mult,
    )
    db.add(trade)
    await db.commit()
    return {"status": "created", "id": trade.id}


@router.put("/{trade_id}")
async def update_journal(trade_id: str, payload: TradeUpdate, db: AsyncSession = Depends(get_db)):
    stmt = select(Trade).where(Trade.id == trade_id)
    res = await db.execute(stmt)
    trade = res.scalar_one_or_none()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    for field, val in payload.model_dump(exclude_unset=True).items():
        if val is not None:
            setattr(trade, field, val)

    await db.commit()
    return {"status": "updated", "id": trade.id}


@router.delete("/{trade_id}")
async def delete_journal(trade_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Trade).where(Trade.id == trade_id)
    res = await db.execute(stmt)
    trade = res.scalar_one_or_none()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    await db.delete(trade)
    await db.commit()
    return {"status": "deleted", "id": trade_id}


@router.post("/{trade_id}/ai-review")
async def generate_ai_trade_review(trade_id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Trade).where(Trade.id == trade_id)
    res = await db.execute(stmt)
    trade = res.scalar_one_or_none()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    from ai.providers.gemini import GeminiProvider
    provider = GeminiProvider()

    prompt = f"""You are an elite trading coach analyzing a logged trade for Traders World AI.

Trade Details:
- Symbol: {trade.symbol}
- Direction: {trade.direction}
- Setup Quality: {trade.setup_quality}
- Entry Price: {trade.entry_price}
- Stop Loss: {trade.stop_loss}
- Take Profit: {trade.take_profit}
- Result: {trade.result}
- R-Multiple: {trade.r_multiple}
- Notes: {trade.notes or 'None'}

Provide a 3-part structured trade critique:
1. 📊 Setup & Execution Evaluation
2. ⚠️ Violations & Emotional Risks Flagged
3. 💡 Key Takeaway / Lesson for Future Trades
"""
    try:
        review_text, _ = await provider.generate(prompt, model="flash")
    except Exception as e:
        review_text = (
            f"AI Review for {trade.symbol} ({trade.direction}): Setup rated as {trade.setup_quality.upper()}. "
            f"Result: {trade.result.upper()} ({trade.r_multiple}R). Keep strict adherence to Rule 01 (HTF Bias) "
            f"and Rule 02 (LTF Confirmation)."
        )

    trade.lessons = review_text
    await db.commit()

    return {"status": "success", "trade_id": trade_id, "review": review_text}
