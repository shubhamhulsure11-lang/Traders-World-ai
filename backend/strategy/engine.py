"""
Strategy Engine — Validates market setup against Smart Money Concepts (SMC) rules.
Stage 3 of the AI Orchestrator pipeline.
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class StrategyValidation:
    verdict: str  # "valid" | "invalid" | "incomplete"
    confidence: str  # "high" | "medium" | "low"
    checklist: Dict[str, Optional[bool]] = field(default_factory=dict)
    rules_satisfied: List[str] = field(default_factory=list)
    rules_missing: List[str] = field(default_factory=list)


class StrategyEngine:
    def __init__(self):
        self.rule_checklist = [
            ("htf_bias_confirmed", "Rule 01: Higher Timeframe Bias confirmed"),
            ("aplus_zone_reached", "Rule 02: Price at key A+ Premium/Discount Zone"),
            ("liquidity_swept", "Rule 03: Liquidity sweep completed"),
            ("structure_shifted", "Rule 04: Structure Shift (BOS/ChoCH) on LTF"),
            ("confirmation_formed", "Rule 05: Confirmation candle (Engulfing/Pattern) formed"),
            ("stop_loss_defined", "Rule 06: Stop Loss logically defined at invalidation"),
            ("risk_acceptable", "Rule 07: Risk per trade <= 1-2% & RR >= 1:2"),
            ("target_identified", "Rule 08: Logical Take Profit target identified"),
        ]

    def validate(self, market_context: dict) -> StrategyValidation:
        """
        Evaluates market context against documented SMC rules.
        """
        checklist = {}
        satisfied = []
        missing = []

        for key, description in self.rule_checklist:
            val = market_context.get(key)
            checklist[description] = val
            if val is True:
                satisfied.append(description)
            elif val is False or val is None:
                missing.append(description)

        total_rules = len(self.rule_checklist)
        satisfied_count = len(satisfied)

        if satisfied_count == total_rules:
            verdict = "valid"
            confidence = "high"
        elif satisfied_count >= 5 and "Rule 01: Higher Timeframe Bias confirmed" in satisfied:
            verdict = "incomplete"
            confidence = "medium"
        else:
            verdict = "invalid"
            confidence = "low"

        return StrategyValidation(
            verdict=verdict,
            confidence=confidence,
            checklist=checklist,
            rules_satisfied=satisfied,
            rules_missing=missing,
        )
