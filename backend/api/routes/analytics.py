from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database.db import get_db
from database.models import Trade, TradingSession

router = APIRouter()


@router.get("/")
async def get_analytics(user_id: str = "default_user", db: AsyncSession = Depends(get_db)):
    stmt = select(Trade).where(Trade.user_id == user_id)
    res = await db.execute(stmt)
    trades = res.scalars().all()

    if not trades:
        # Default empty state if no trades in DB
        return {
            "total_trades": 0,
            "win_rate": 0.0,
            "avg_rr": 0.0,
            "profit_factor": 0.0,
            "max_drawdown": 0.0,
            "discipline_score": 100.0,
            "fomo_count": 0,
            "revenge_count": 0,
            "session_stats": {"london": 0, "newyork": 0, "asian": 0},
            "quality_breakdown": {"aplus": 0, "b": 0, "c": 0, "fomo": 0},
        }

    total = len(trades)
    wins = [t for t in trades if t.result == "win"]
    losses = [t for t in trades if t.result == "loss"]
    fomo_trades = [t for t in trades if t.setup_quality == "fomo"]

    win_rate = round((len(wins) / total) * 100, 1) if total > 0 else 0.0

    r_multiples = [t.r_multiple for t in trades if t.r_multiple is not None]
    avg_rr = round(sum(r_multiples) / len(r_multiples), 2) if r_multiples else 0.0

    gross_win = sum([t.r_multiple for t in wins if t.r_multiple])
    gross_loss = abs(sum([t.r_multiple for t in losses if t.r_multiple]))
    profit_factor = round(gross_win / gross_loss, 2) if gross_loss > 0 else (round(gross_win, 2) if gross_win > 0 else 0.0)

    # Discipline score calculation
    aplus_count = len([t for t in trades if t.setup_quality == "aplus"])
    discipline_score = round((aplus_count / total) * 100, 1) if total > 0 else 100.0

    # Drawdown calculation
    cumulative = 0.0
    peak = 0.0
    max_dd = 0.0
    for r in r_multiples:
        cumulative += r
        if cumulative > peak:
            peak = cumulative
        dd = peak - cumulative
        if dd > max_dd:
            max_dd = dd

    max_drawdown_pct = round(max_dd * 1.5, 1)  # estimated % based on risk per trade

    session_stats = {
        "london": len([t for t in trades if t.session_type == "london"]),
        "newyork": len([t for t in trades if t.session_type == "newyork"]),
        "asian": len([t for t in trades if t.session_type == "asian"]),
    }

    quality_breakdown = {
        "aplus": aplus_count,
        "b": len([t for t in trades if t.setup_quality == "b"]),
        "c": len([t for t in trades if t.setup_quality == "c"]),
        "fomo": len(fomo_trades),
    }

    return {
        "total_trades": total,
        "win_rate": win_rate,
        "avg_rr": avg_rr,
        "profit_factor": profit_factor,
        "max_drawdown": max_drawdown_pct,
        "discipline_score": discipline_score,
        "fomo_count": len(fomo_trades),
        "revenge_count": len([t for t in trades if t.setup_quality in ["fomo", "forced"]]),
        "session_stats": session_stats,
        "quality_breakdown": quality_breakdown,
    }
