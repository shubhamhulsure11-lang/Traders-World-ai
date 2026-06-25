# TradeLens AI — Product Requirements Document (PRD) & API Contracts

> **Version:** 1.0.0 MVP | **Author:** Shubham Hulsure | **Status:** Active

---

## 1. Product Overview

**TradeLens AI** is an AI-powered Market Intelligence Operating System that provides a 24/7 AI analyst scanning global macro markets, filtering noise, and surfacing actionable intelligence for serious traders.

**Core Question Answered:** *"What should I focus on right now, and why?"*

### Core Outputs
| Output | Description |
|---|---|
| Market Bias | Overall directional bias per asset (Bullish/Bearish/Neutral) |
| Session Bias | Active trading session intelligence (Asian/London/NY) |
| Asset Strength | Relative strength ranking across assets |
| Correlation Analysis | Real-time cross-asset correlation matrix |
| News Impact | AI-scored news with asset tagging and direction |
| Technical Confluence | Multi-timeframe signal alignment |
| AI Trade Intelligence | Synthesized actionable alerts |

---

## 2. MVP Scope (Phase 1)

### Assets Covered
- XAUUSD (Gold) — Primary focus
- DXY (US Dollar Index)
- US10Y (10-Year Treasury Yield)
- EURUSD
- SPX (S&P 500)
- BTC (Bitcoin)
- ETH (Ethereum)

### Phase 1 Features
- [x] Live globe-centric dashboard
- [x] Market top bar with real-time prices
- [x] AI Market Bias panel (per asset)
- [x] AI Intelligence News Feed
- [x] Session Intelligence panel (Asia/London/NY)
- [x] Correlation Panel
- [x] Supabase backend (price_snapshots, alerts, news_log, saved_signals)
- [x] Telegram alert integration
- [ ] Economic Calendar AI (Phase 2)
- [ ] Gold dedicated page (Phase 2)
- [ ] Live data feed integration (Phase 2)

### Phase 2 Features
- Economic Calendar with AI impact scoring
- Gold intelligence page
- Real market data (Yahoo Finance / Alpha Vantage)
- User watchlists (Supabase auth)
- Backtesting journal

### Phase 3 Features
- Trade journal with P&L tracking
- AI strategy recommendations
- Multi-user support
- Mobile app (React Native)

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TradeLens AI                         │
├───────────────────────┬─────────────────────────────────┤
│   HOT PATH (Real-time)│   AI REASONING PATH             │
│   Price feeds         │   News analysis                 │
│   WebSocket SSE       │   Bias calculation              │
│   Market bar updates  │   Correlation engine            │
└───────────┬───────────┴──────────────┬──────────────────┘
            │                          │
     ┌──────▼──────┐          ┌───────▼───────┐
     │  Next.js    │          │   Supabase    │
     │  API Routes │◄────────►│   PostgreSQL  │
     │  (Vercel)   │          │   + RLS       │
     └──────┬──────┘          └───────────────┘
            │
     ┌──────▼──────┐
     │  Telegram   │
     │  Bot API    │
     └─────────────┘
```

### Tech Stack
| Layer | Technology | Tier |
|---|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind | Free (Vercel) |
| 3D Globe | Three.js + React Three Fiber | Free |
| Animation | Framer Motion | Free |
| Database | Supabase PostgreSQL | Free tier |
| Auth | Supabase Auth (Phase 2) | Free tier |
| Deployment | Vercel | Free tier |
| Alerts | Telegram Bot API | Free |
| Data | Yahoo Finance (Phase 2) | Free |

---

## 4. API Contracts

### Base URL
```
https://traders-world-ai.vercel.app/api
```

### 4.1 GET /api/prices
Returns latest price snapshot for all tracked assets.

**Response:**
```json
{
  "prices": [
    {
      "symbol": "XAUUSD",
      "name": "Gold",
      "price": 2338.50,
      "change": 12.30,
      "changePct": 0.42,
      "category": "commodity",
      "icon": "🥇"
    }
  ],
  "source": "supabase",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4.2 GET /api/news
Returns latest AI-scored news items from news_log table.

**Response:**
```json
{
  "news": [
    {
      "id": "uuid",
      "headline": "Fed holds rates steady",
      "source": "Reuters",
      "time": "2 min ago",
      "impact": "HIGH",
      "impactScore": 85,
      "assets": ["XAUUSD", "DXY", "US10Y"],
      "direction": "BEARISH",
      "confidence": 82,
      "category": "monetary_policy",
      "region": "US",
      "summary": "..."
    }
  ],
  "source": "supabase",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4.3 GET /api/bias
Returns AI-generated market bias per asset.

**Response:**
```json
{
  "biases": [
    {
      "asset": "XAUUSD",
      "bias": "BULLISH",
      "confidence": 78,
      "reasoning": "Fed dovish + safe haven demand + technical breakout",
      "timeframe": "4H",
      "keyLevels": { "support": 2310, "resistance": 2360 }
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4.4 GET /api/alerts
Returns latest alerts from Supabase alerts table.

**Response:**
```json
{
  "alerts": [
    {
      "id": "uuid",
      "asset": "XAUUSD",
      "bias": "bullish",
      "confidence": 78,
      "headline": "Gold approaching 2350 resistance",
      "impact": "high",
      "source": "TradeLens AI",
      "telegramSent": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "source": "supabase",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4.5 POST /api/alerts
Create a new alert.

**Request Body:**
```json
{
  "asset": "XAUUSD",
  "bias": "bullish",
  "confidence": 78,
  "headline": "Custom alert headline",
  "impact": "high",
  "source": "user"
}
```

### 4.6 POST /api/telegram
Send an alert to Telegram channel.

**Request Body:**
```json
{
  "asset": "XAUUSD",
  "bias": "bullish",
  "confidence": 78,
  "headline": "Alert message",
  "impact": "high",
  "source": "TradeLens AI",
  "alertId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Alert sent to Telegram"
}
```

---

## 5. Database Schema

### price_snapshots
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| symbol | varchar | Asset symbol (XAUUSD, BTC, etc.) |
| price | numeric | Current price |
| change_pct | numeric | % change |
| created_at | timestamptz | Timestamp |

### news_log
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| headline | text | News headline |
| source | varchar | Source (Reuters, Bloomberg, etc.) |
| impact | varchar | Impact level (high/medium/low) |
| impact_score | integer | 0-100 AI impact score |
| assets | jsonb | Array of affected asset symbols |
| direction | varchar | bullish/bearish/neutral |
| category | varchar | monetary_policy/commodities/etc. |
| region | varchar | Geographic region |
| summary | text | AI summary |
| created_at | timestamptz | Timestamp |

### alerts
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| asset | varchar | Asset symbol |
| bias | varchar | bullish/bearish/neutral |
| confidence | integer | 0-100 confidence score |
| headline | text | Alert headline |
| impact | varchar | high/medium/low |
| source | varchar | Alert source |
| telegram_sent | boolean | Whether sent to Telegram |
| created_at | timestamptz | Timestamp |

### saved_signals
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | User ID (future auth) |
| asset | varchar | Asset symbol |
| signal_data | jsonb | Signal details |
| created_at | timestamptz | Timestamp |

---

## 6. Telegram Setup Guide

To activate Telegram alerts:

1. Open Telegram, search for **@BotFather**
2. Send `/newbot` and follow instructions
3. Copy your bot token
4. Send a message to your bot, then visit:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
5. Copy your `chat_id`
6. Update Vercel environment variables:
   - `TELEGRAM_BOT_TOKEN` = your bot token
   - `TELEGRAM_CHAT_ID` = your chat ID
7. Redeploy on Vercel

---

## 7. Milestone Timeline

| Week | Milestone | Status |
|---|---|---|
| W1 | Next.js scaffold + Globe UI + Core panels | ✅ Done |
| W1 | Supabase schema + test data | ✅ Done |
| W1 | Vercel deployment | ✅ Done |
| W1 | API routes (prices, news, bias, alerts, telegram) | ✅ Done |
| W2 | Real price data (Yahoo Finance/Alpha Vantage) | 🔜 Next |
| W2 | Economic Calendar AI panel | 🔜 Next |
| W2 | Gold dedicated page | 🔜 Next |
| W3 | Live news ingestion (RSS/NewsAPI) | 🔜 Phase 2 |
| W3 | Supabase Auth + user watchlists | 🔜 Phase 2 |
| W4 | Backtesting & trade journal | 🔜 Phase 3 |

---

## 8. Zero-Cost MVP Stack

| Service | Free Tier Limits | Usage |
|---|---|---|
| Vercel | 100GB bandwidth, unlimited deploys | Frontend + API |
| Supabase | 500MB DB, 2GB bandwidth | Database + Auth |
| Telegram | Unlimited | Alerts |
| GitHub | Unlimited public repos | Source control |
| Yahoo Finance | Unofficial API (rate limited) | Price data (Phase 2) |

**Total monthly cost: $0**

---

*Built by Shubham Hulsure | TradeLens AI — AI Market Intelligence Operating System*
