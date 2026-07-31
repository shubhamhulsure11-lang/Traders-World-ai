from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from database.models import Trade

router = APIRouter()


class TradeCreate(BaseModel):
    user_id: str = "default_user"
    symbol: str
    direction: str  # long | short
    entry_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    notes: Optional[str] = None
    setup_quality: Optional[str] = "aplus"


@router.get("/")
async def list_journals(db: AsyncSession = Depends(get_db)):
    stmt = select(Trade).order_by(Trade.created_at.desc())
    res = await db.execute(stmt)
    trades = res.scalars().all()
    return [{"id": t.id, "symbol": t.symbol, "direction": t.direction, "setup_quality": t.setup_quality, "created_at": t.created_at} for t in trades]


@router.post("/")
async def create_journal(payload: TradeCreate, db: AsyncSession = Depends(get_db)):
    trade = Trade(
        user_id=payload.user_id,
        symbol=payload.symbol,
        direction=payload.direction,
        entry_price=payload.entry_price,
        stop_loss=payload.stop_loss,
        take_profit=payload.take_profit,
        notes=payload.notes,
        setup_quality=payload.setup_quality,
    )
    db.add(trade)
    await db.commit()
    return {"status": "created", "id": trade.id}
