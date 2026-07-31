# 15_API_SPECIFICATION.md

# Traders World AI — API Specification

## Purpose

This document defines how every module communicates.

The API layer separates the frontend, AI services, knowledge engine, voice system, TradingView integration, and future mobile applications.

---

# Architecture

Frontend
    ↓
REST / WebSocket API
    ↓
FastAPI Backend
    ↓
AI Orchestrator
    ↓
Knowledge • Memory • Strategy • Analytics

---

# Design Principles

- Versioned APIs (/api/v1)
- Stateless endpoints where possible
- JWT authentication (future)
- Streaming support
- Provider-independent AI

---

# Core Services

## AI Service

POST /api/v1/chat

Purpose:
Send a user message and receive an AI response.

Features:
- Streaming
- Conversation context
- Knowledge retrieval
- Strategy reasoning

---

## Voice Service

POST /api/v1/voice/transcribe

Speech → Text

POST /api/v1/voice/speak

Text → Speech

GET /api/v1/voice/session

Current voice session information.

---

## Knowledge Service

GET /api/v1/knowledge/search

Search strategy documents.

POST /api/v1/knowledge/upload

Upload markdown, PDFs, screenshots, journals.

POST /api/v1/knowledge/reindex

Rebuild search index after updates.

---

## Strategy Service

POST /api/v1/strategy/evaluate

Input:
- Symbol
- Timeframe
- Market context

Output:
- HTF bias
- Rules satisfied
- Missing confirmations
- Risk observations
- Educational explanation

---

## Journal Service

POST /api/v1/journal

Create a trade journal.

GET /api/v1/journal

Retrieve journals.

PUT /api/v1/journal/{id}

Update journal.

DELETE /api/v1/journal/{id}

Delete journal.

---

## Backtest Service

POST /api/v1/backtests/run

Run a historical analysis.

GET /api/v1/backtests

Retrieve previous backtests.

---

## TradingView Service

POST /api/v1/chart/context

Receive:
- Symbol
- Timeframe
- Indicator values
- Alerts

The AI uses structured data rather than raw screenshots whenever possible.

---

## Memory Service

GET /api/v1/memory/session

Retrieve active session context.

POST /api/v1/memory/update

Update conversation memory.

POST /api/v1/memory/reset

Reset current session.

---

# WebSocket Channels

/ws/chat
- Streaming AI responses

/ws/voice
- Real-time voice

/ws/chart
- Live TradingView updates

/ws/events
- Notifications

---

# Error Standard

Every response should include:
- success
- message
- data
- timestamp
- request_id

---

# Security

- HTTPS only
- Authentication (future)
- Rate limiting
- Input validation
- Audit logging

---

# Long-Term Vision

The API becomes the backbone of Traders World AI, allowing every interface—web, desktop, mobile, voice, and future integrations—to communicate through one consistent, scalable platform.
