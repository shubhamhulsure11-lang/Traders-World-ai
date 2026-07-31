# 05_STRATEGY_ENGINE.md

# Traders World AI — Strategy Engine

## Purpose

The Strategy Engine is the heart of the trading methodology.

Its job is NOT to create strategies.

Its job is to understand, validate, and explain the founder's documented trading rules.

---

# Design Philosophy

One Strategy.
One Rulebook.
One Source of Truth.

Every AI response must be based on documented strategy rules.

---

# Strategy Flow

1. Higher Timeframe Analysis
2. Market Structure
3. Identify Liquidity
4. Define A+ Zone
5. Wait for Lower Timeframe Confirmation
6. Validate Entry
7. Calculate Risk
8. Execute Trade
9. Manage Trade
10. Review & Journal

The AI follows this sequence every time.

---

# Higher Timeframe (HTF)

Responsibilities:
- Determine overall trend
- Mark key support/resistance
- Identify premium & discount
- Define directional bias

Without HTF bias, no trade evaluation should continue.

---

# Lower Timeframe (LTF)

Look for:

- Change of Character (ChoCH)
- Break of Structure (BOS)
- Engulfing candles
- Morning/Evening Star
- Confirmation candles
- Entry trigger

The AI should explain which confirmation exists and which is missing.

---

# Entry Checklist

Before every trade ask:

- HTF bias confirmed?
- A+ zone reached?
- Liquidity sweep completed?
- Structure shifted?
- Confirmation candle formed?
- Stop loss defined?
- Risk acceptable?
- Target identified?

If any answer is "No", recommend waiting.

---

# Risk Management

Rules include:

- Fixed risk per trade
- Stop-loss required
- Risk-to-Reward minimum
- Maximum daily loss
- Maximum weekly loss
- Respect prop firm drawdown

The AI must warn when rules are violated.

---

# Trade Management

Monitor:

- Entry quality
- Partial profits
- Stop movement
- Exit conditions
- Emotional decisions

Explain every action.

---

# Post Trade Review

Record:

- Screenshot
- Setup quality
- Rule adherence
- Emotions
- Mistakes
- Lessons learned

This feeds the Knowledge Base.

---

# Future Integration

The Strategy Engine will receive context from:

- TradingView
- Custom indicators
- Knowledge Base
- Journals
- Backtests

It combines all inputs before evaluating a trade.

---

# Golden Rules

- Never force a setup.
- Never predict.
- Follow the documented methodology.
- Explain every decision.
- Teach while evaluating.
- Improve using documented evidence, never assumptions.
