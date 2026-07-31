from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from database.models import Backtest

router = APIRouter()


@router.get("/")
async def get_backtests(db: AsyncSession = Depends(get_db)):
    stmt = select(Backtest).order_by(Backtest.created_at.desc())
    res = await db.execute(stmt)
    backtests = res.scalars().all()
    return [{"id": b.id, "strategy_name": b.strategy_name, "sample_size": b.sample_size, "win_rate": b.win_rate, "profit_factor": b.profit_factor} for b in backtests]
