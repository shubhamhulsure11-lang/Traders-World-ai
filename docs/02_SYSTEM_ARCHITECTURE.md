# 02_SYSTEM_ARCHITECTURE.md

# Traders World AI — System Architecture

## Philosophy

Build a modular, AI-first platform where every subsystem can evolve independently.
Nothing should be tightly coupled to a single AI provider, voice engine, broker, or charting library.

---

# High-Level Components

1. Frontend (Next.js)
2. Backend API (FastAPI)
3. AI Orchestrator
4. Voice Engine
5. Knowledge Engine
6. Strategy Engine
7. Memory Engine
8. TradingView Integration
9. Backtesting Engine
10. Analytics Engine

---

# Frontend

Responsibilities

- Premium dashboard
- Voice interface
- Chat
- TradingView workspace
- Journal
- Backtest viewer
- Settings

Never contains business logic.

---

# Backend

Responsibilities

- Authentication (future)
- API
- WebSockets
- AI orchestration
- Session management
- Strategy evaluation
- Memory retrieval

Acts as the central brain.

---

# AI Orchestrator

Routes every request.

Determines:

- Which knowledge to load
- Which memories matter
- Which AI provider to use
- Whether screenshots are required
- Whether TradingView context is needed

The frontend never calls an LLM directly.

---

# Knowledge Engine

The permanent brain.

Sources include:

- Markdown documents
- Strategy notes
- Backtests
- Trade journals
- Annotated screenshots
- FAQs
- Examples
- Rules

Every document becomes searchable.

Future:
RAG-based retrieval.

---

# Strategy Engine

Stores only the founder's methodology.

Contains:

- HTF bias
- A+ zones
- Liquidity
- ChoCH
- Confirmation candles
- Risk rules
- TP/SL logic
- Invalidations

No AI-generated strategy.

Only documented rules.

---

# Memory Engine

Four layers:

1. Conversation Memory
2. Trading Session Memory
3. User Preference Memory
4. Long-Term Knowledge Memory

The AI remembers context but always references documented rules.

---

# Voice Architecture

Microphone
↓

Speech-to-Text
↓

AI Orchestrator
↓

Reasoning

↓

Text-to-Speech

↓

Speaker

Streaming both directions.

Interruptions supported.

---

# TradingView Integration

Future responsibilities:

- Display charts
- Read indicator output
- Track timeframe
- Receive alerts
- Receive structured strategy context

The AI reasons from structured market data rather than raw images whenever possible.

---

# Backtesting Engine

Runs historical analysis.

Produces:

- Win rate
- RR statistics
- Session analysis
- Setup statistics
- Trade examples

Results become part of the Knowledge Engine.

---

# Provider Abstraction

Every external service is replaceable.

Examples:

- OpenAI
- Ollama
- Gemini
- Anthropic
- DeepSeek

Changing providers should require minimal code changes.

---

# Suggested Folder Structure

project/
├── frontend/
├── backend/
├── docs/
├── knowledge/
├── prompts/
├── strategy/
├── backtests/
├── journals/
├── screenshots/
├── api/
└── scripts/

---

# Guiding Principles

- Documentation before implementation.
- Local-first during development.
- Modular by default.
- Explainable AI.
- Strategy-driven, never prediction-driven.
- Build for scale from day one.
