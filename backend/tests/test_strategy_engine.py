import pytest
from strategy.engine import StrategyEngine


def test_strategy_engine_all_valid():
    engine = StrategyEngine()
    market_context = {
        "htf_bias_confirmed": True,
        "aplus_zone_reached": True,
        "liquidity_swept": True,
        "structure_shifted": True,
        "confirmation_formed": True,
        "stop_loss_defined": True,
        "risk_acceptable": True,
        "target_identified": True,
    }
    res = engine.validate(market_context)
    assert res.verdict == "valid"
    assert res.confidence == "high"
    assert len(res.rules_satisfied) == 8
    assert len(res.rules_missing) == 0


def test_strategy_engine_incomplete():
    engine = StrategyEngine()
    market_context = {
        "htf_bias_confirmed": True,
        "aplus_zone_reached": True,
        "liquidity_swept": True,
        "structure_shifted": True,
        "confirmation_formed": True,
        "stop_loss_defined": False,
        "risk_acceptable": False,
        "target_identified": False,
    }
    res = engine.validate(market_context)
    assert res.verdict == "incomplete"
    assert res.confidence == "medium"
    assert "Rule 06: Stop Loss logically defined at invalidation" in res.rules_missing


def test_strategy_engine_invalid():
    engine = StrategyEngine()
    market_context = {
        "htf_bias_confirmed": False,
        "aplus_zone_reached": False,
    }
    res = engine.validate(market_context)
    assert res.verdict == "invalid"
    assert res.confidence == "low"
