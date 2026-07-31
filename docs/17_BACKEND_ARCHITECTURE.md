# 17_BACKEND_ARCHITECTURE.md

# Traders World AI — Backend Architecture

## Purpose

The backend is the central brain of Traders World AI.

It coordinates every subsystem including the AI Copilot, Knowledge Base, Memory System, Strategy Engine, Voice Services, Backtesting, Journaling, and future cloud services.

---

# Core Principles

- Modular architecture
- API-first design
- AI-provider independent
- Scalable services
- Local-first development
- Documentation before implementation

---

# Technology Stack

- FastAPI
- Python
- Uvicorn
- WebSockets
- SQLAlchemy
- PostgreSQL / SQLite
- Redis (future)
- Vector Database (future)

---

# High-Level Modules

backend/
├── api/
├── ai/
├── memory/
├── knowledge/
├── strategy/
├── voice/
├── journal/
├── backtests/
├── analytics/
├── tradingview/
├── auth/
├── database/
├── workers/
└── utils/

Each module has a single responsibility.

---

# AI Orchestrator

The orchestrator is the decision hub.

Responsibilities:

- Detect user intent
- Retrieve knowledge
- Load memory
- Select AI role
- Build prompts
- Choose AI provider
- Return explainable response

The frontend never communicates directly with an LLM.

---

# Knowledge Service

Responsibilities:

- Index markdown files
- Search documents
- Version knowledge
- Retrieve relevant context
- Support RAG

---

# Memory Service

Manages:

- Working Memory
- Conversation Memory
- Trading Session Memory
- Long-Term Knowledge references

---

# Strategy Service

Validates:

- HTF Bias
- LTF Confirmation
- Liquidity
- BOS / ChoCH
- A+ Checklist
- Risk Management

Returns explanations instead of trade signals.

---

# Voice Service

Pipeline:

Speech → Text
↓
AI Orchestrator
↓
Response
↓
Text → Speech

Supports streaming conversations.

---

# Journal Service

Functions:

- Create journal
- Update journal
- Attach screenshots
- Store emotions
- Record lessons

Feeds the Knowledge Base.

---

# Backtesting Service

Responsibilities:

- Historical analysis
- Performance metrics
- Pattern discovery
- Strategy statistics

Results become searchable knowledge.

---

# Background Workers

Future tasks:

- Re-index documents
- Generate embeddings
- Process screenshots
- Analytics calculations
- Scheduled maintenance

---

# Logging & Monitoring

Track:

- API requests
- AI latency
- Errors
- Retrieval quality
- Voice performance

---

# Security

- Input validation
- Authentication (future)
- Authorization
- Rate limiting
- Audit logs
- Secure secrets management

---

# Long-Term Vision

The backend evolves into an intelligent orchestration platform where every subsystem works together to provide a fast, explainable, scalable AI Trading Copilot capable of supporting web, desktop, mobile, and future integrations.
