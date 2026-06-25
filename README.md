# TradeLens AI

> **AI Market Intelligence Operating System**
> Real-time macro, geopolitical & cross-asset analysis for serious traders.
> Built by **Shubham Hulsure**

---

## What is TradeLens AI?

TradeLens AI is a premium, globe-centric market intelligence dashboard that answers one question:

> **"What should I focus on right now — and why?"**

It ingests live market data, macro events, and news — then surfaces ranked, explainable signals across Gold, FX, Crypto, and Bonds.

---

## Core Modules (Phase 1 MVP)

| Module | Description |
|---|---|
| **Live Globe** | Interactive 3D globe (Three.js) with news & event markers |
| **Market Bar** | Live animated price ticker — XAUUSD, EURUSD, BTC, ETH |
| **AI Status Bar** | AI engine health: sources scanned, news processed, confidence |
| **AI Bias Panel** | Directional bias cards for each asset with reasoning |
| **Live News Feed** | Real-time news cards with impact scores |
| **Session Panel** | Asia / London / NY session detector with live status |
| **Correlation Panel** | Rolling correlation heatmap across assets |

---

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + Framer Motion
- **3D Globe**: Three.js / React Three Fiber
- **Backend**: Next.js API Routes (MVP) → FastAPI (Phase 2)
- **Database**: Supabase (PostgreSQL) — Free tier
- **Auth**: None (public dashboard for MVP)
- **Deployment**: Vercel (Hobby — free)
- **Alerts**: Telegram Bot API (free)
- **AI**: OpenAI / Claude API (pay-as-you-go, minimal usage)

---

## Project Structure

```
src/
  app/
    layout.tsx          # Root layout with dark theme
    page.tsx            # Dashboard homepage
    globals.css         # Global styles
    api/
      prices/route.ts   # Mock live prices endpoint
      news/route.ts     # Mock live news endpoint
      bias/route.ts     # Mock AI bias endpoint
  components/
    Globe.tsx           # 3D interactive globe
    MarketBar.tsx       # Live price ticker
    AIStatusBar.tsx     # AI engine status bar
    AIBiasPanel.tsx     # AI directional bias cards
    NewsCards.tsx       # Live news feed
    SessionPanel.tsx    # Trading session detector
    CorrelationPanel.tsx # Correlation heatmap
    Sidebar.tsx         # Collapsible navigation
  lib/
    constants.ts        # Assets, sessions, globe markers
    types.ts            # TypeScript interfaces
```

---

## Quick Start (Local)

```bash
# 1. Clone the repo
git clone https://github.com/shubhamhulsure11-lang/Traders-World-ai.git
cd Traders-World-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (Supabase optional for MVP)

# 4. Run the dev server
npm run dev

# 5. Open http://localhost:3000
```

---

## Deploy to Vercel (Zero Cost)

1. Push this repo to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select `Traders-World-ai` repo
4. Framework: **Next.js** (auto-detected)
5. Add environment variables from `.env.example`
6. Click **Deploy**

Vercel Hobby tier is **completely free** and includes:
- Automatic HTTPS
- Global CDN
- Serverless API routes
- Instant deployments on git push

---

## Set Up Telegram Alerts

1. Open Telegram → search `@BotFather`
2. Send `/newbot` → follow prompts → copy your **Bot Token**
3. Message `@userinfobot` to get your **Chat ID**
4. Add to `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=your-bot-token
   TELEGRAM_CHAT_ID=your-chat-id
   ```
5. Alerts will fire when AI detects high-confidence signals

---

## MVP Asset Coverage

| Asset | Symbol | Category |
|---|---|---|
| Gold | XAUUSD | Commodity |
| Euro | EURUSD | FX |
| Bitcoin | BTC | Crypto |
| Ethereum | ETH | Crypto |

---

## Roadmap

### Phase 1 — Foundation (Current)
- [x] Dashboard shell + layout
- [x] Interactive 3D Globe
- [x] Live Market Bar
- [x] AI Status Bar
- [x] AI Bias Panel
- [x] Live News Cards
- [x] Session Intelligence Panel
- [x] Correlation Panel
- [x] Sidebar navigation

### Phase 2 — Intelligence
- [ ] Economic Calendar AI
- [ ] Gold Intelligence Page
- [ ] Real data integration (free APIs)
- [ ] Telegram alert triggers

### Phase 3 — Advanced
- [ ] Chart upload + AI analysis
- [ ] Trade journal
- [ ] AI trading coach
- [ ] Portfolio tracker

---

## Data Sources (Zero Cost)

| Source | Type | Cost |
|---|---|---|
| Yahoo Finance | Prices | Free |
| Investing.com RSS | News | Free |
| ForexFactory RSS | Calendar | Free |
| CoinGecko API | Crypto | Free |
| FRED (St. Louis Fed) | Macro | Free |

---

## Author

**Shubham Hulsure** — Building institutional-grade tools for independent traders.

---

*TradeLens AI — Know what matters. Act with conviction.*
