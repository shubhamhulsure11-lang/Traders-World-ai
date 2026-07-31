# 14_PROMPT_ENGINEERING.md

# Traders World AI — Prompt Engineering

## Purpose

This document defines how prompts are designed so every AI response is consistent, explainable, and aligned with the founder's methodology.

---

# Objectives

- Consistent AI behavior
- Explainable reasoning
- Modular prompts
- Easy provider switching
- Version-controlled prompt library

---

# Prompt Layers

## 1. System Prompt

Defines permanent behavior.

Responsibilities:
- Never predict markets.
- Never invent strategy rules.
- Always explain reasoning.
- Follow documented methodology.
- Ask questions if context is missing.

---

## 2. Role Prompt

Dynamic roles:

- Teacher
- Execution Coach
- Chart Analyst
- Research Assistant
- Psychology Coach

The orchestrator selects the appropriate role.

---

## 3. Knowledge Prompt

Injects retrieved context from:

- Strategy docs
- Rules
- Journals
- Backtests
- Examples
- Glossary

Only relevant information is included.

---

## 4. User Prompt

The user's request.

Examples:
- Explain liquidity.
- Review this trade.
- Is confirmation complete?
- Quiz me on market structure.

---

## 5. Output Prompt

Standard response structure:

1. Observation
2. Evidence
3. Strategy Rule
4. Explanation
5. Recommendation
6. Next Step

---

# Prompt Templates

## Teaching

Goal:
Educate step-by-step.

Output:
- Explanation
- Example
- Common mistakes
- Quiz question

---

## Trade Review

Output:
- What was correct
- What violated the rules
- Risk review
- Lesson learned

---

## Live Analysis

Output:
- HTF Bias
- Market Structure
- Confirmation
- Missing Rules
- Risk Assessment

Never issue direct buy/sell commands.

---

# Guardrails

The AI must never:
- Promise profits
- Predict future candles
- Create undocumented rules
- Hide uncertainty

The AI should:
- Ask clarifying questions
- Cite documentation
- Explain every conclusion

---

# Prompt Versioning

Every prompt should include:
- Version
- Purpose
- Last updated
- Dependencies
- Supported AI providers

---

# Long-Term Vision

Prompt engineering becomes the control layer that keeps every AI provider behaving like the same Traders World AI Copilot regardless of the underlying model.
