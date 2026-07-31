# Traders World AI

> An AI Trading Operating System — your personal mentor, built on Smart Money Concepts.

## Quick Start (One Command)

```bash
# 1. Clone and enter the project
cd traders-world-ai

# 2. Copy environment template
cp .env.example .env
# ✏️  Add your Gemini API key to .env (free at aistudio.google.com)

# 3. Start everything
docker-compose up
```

**Dashboard:** http://localhost:3000
**API:** http://localhost:8000
**API Docs:** http://localhost:8000/docs
**ChromaDB:** http://localhost:8001

---

## What This Is

Traders World AI is **not** a trading bot or signal provider.

It is an AI Trading Copilot that:
- Learns your exact trading methodology
- Coaches you through live execution
- Teaches the strategy step by step
- Reviews your trades and journals
- Researches historical performance

**The AI never predicts. It only explains WHY a setup is valid or invalid according to documented strategy rules.**

---

## Tech Stack (100% Free)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind |
| Backend | FastAPI + Python 3.11 |
| AI | Google Gemini 1.5 Flash (free tier) |
| Voice | Web Speech API (browser native) |
| Vector Store | ChromaDB (local) |
| Database | SQLite → PostgreSQL |
| Charts | TradingView Lightweight Charts |

---

## Development Without Docker

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
traders-world-ai/
├── frontend/        # Next.js 14 dashboard
├── backend/         # FastAPI + AI orchestrator
├── knowledge/       # Strategy docs (the AI's brain)
├── prompts/         # Versioned prompt library
├── data/            # Database + ChromaDB storage
└── docs/            # Planning documents
```

---

## Knowledge Base

The `knowledge/` folder is the AI's permanent brain.

Add markdown files here and the AI learns from them automatically.

```
knowledge/
├── strategy/    # Complete trading methodology
├── rules/       # Individual rules (rule_01.md, etc.)
├── psychology/  # FOMO, discipline, revenge trading
├── glossary/    # Trading concept definitions
├── examples/    # Case studies and chart examples
├── journal/     # Trade journals
└── backtests/   # Historical backtest results
```

---

## License

Private — Traders World AI. All rights reserved.
