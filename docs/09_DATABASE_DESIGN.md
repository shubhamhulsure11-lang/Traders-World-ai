# 09_DATABASE_DESIGN.md

# Traders World AI — Database Design

## Purpose

The database is the central storage layer for Traders World AI.

It stores every piece of information required for learning, coaching, research, analytics, and future SaaS functionality.

The design should be modular, scalable, and provider-independent.

---

# Design Principles

- Single source of truth
- Modular architecture
- Easy to extend
- AI-friendly
- Audit friendly
- Future cloud ready

---

# Core Entities

## Users

Stores:

- User ID
- Name
- Email (future)
- Role
- Preferences
- Settings
- Subscription (future)

---

## Conversations

Stores:

- Conversation ID
- User ID
- Timestamp
- Voice/Text
- AI Response
- Context Summary

Purpose:
Allow the AI to maintain conversational continuity.

---

## Knowledge Base

Stores references to:

- Strategy documents
- Rules
- Lessons
- Glossary
- Research papers
- Examples

Each document should have:

- Title
- Category
- Version
- Tags
- Author
- Last Updated

---

## Trade Journal

Every trade contains:

- Trade ID
- User ID
- Symbol
- Direction
- Entry
- Exit
- Stop Loss
- Take Profit
- Session
- HTF Bias
- LTF Confirmation
- Screenshot Path
- Emotions
- Notes
- Rule Violations
- Lessons Learned

---

## Backtests

Store:

- Strategy Name
- Test Date
- Sample Size
- Win Rate
- RR
- Profit Factor
- Drawdown
- Session Statistics
- Notes

---

## Psychology Records

Track:

- FOMO
- Revenge Trading
- Impatience
- Fear
- Confidence
- Discipline Score

Purpose:
Identify recurring behavioural patterns.

---

## Voice Sessions

Store:

- Session ID
- Conversation ID
- Transcript
- Duration
- Topics Discussed

Future:
Voice search across previous sessions.

---

## AI Memory

Memory Types:

1. Short-Term Memory
2. Session Memory
3. Long-Term Memory
4. Knowledge Memory

Only long-term knowledge should influence strategy guidance.

---

# Relationships

User
 ├── Conversations
 ├── Trade Journal
 ├── Voice Sessions
 ├── Backtests
 └── Preferences

Knowledge Base
 ├── Strategy
 ├── Rules
 ├── Examples
 ├── Lessons
 └── Glossary

Trade Journal
 ├── Screenshots
 ├── Psychology
 └── Backtests

---

# Future Storage

Potential technologies:

- PostgreSQL
- SQLite (local development)
- Vector Database (Knowledge Retrieval)
- Object Storage (Screenshots)
- Redis (Caching)

Each storage layer has a single responsibility.

---

# Scalability

The database should support:

- Thousands of users
- Millions of conversations
- Millions of journal entries
- Large knowledge bases
- High-performance AI retrieval

---

# Long-Term Vision

The database becomes the permanent memory of Traders World AI, connecting conversations, strategy knowledge, journals, analytics, voice sessions, and research into one intelligent ecosystem.
