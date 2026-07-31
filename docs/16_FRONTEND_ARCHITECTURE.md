# 16_FRONTEND_ARCHITECTURE.md

# Traders World AI — Frontend Architecture

## Purpose

The frontend is the primary workspace for traders. It must feel fast, modern, and distraction-free while presenting AI guidance alongside charts.

---

# Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- Zustand (or equivalent) for client state

---

# Design Principles

- Premium dark theme
- Responsive layout
- Component-driven architecture
- Minimal clicks
- Keyboard shortcuts
- Real-time updates

---

# Primary Layout

Header
├── Logo
├── Symbol Selector
├── Session Status
└── User Menu

Sidebar
├── Dashboard
├── AI Chat
├── Voice
├── Journal
├── Backtests
├── Knowledge Base
├── Settings

Main Workspace
├── TradingView Chart
├── AI Copilot Panel
├── Trade Checklist
└── Notes

Bottom Dock
├── Voice Controls
├── Notifications
└── Live Status

---

# Core Pages

- Dashboard
- Chat
- Voice
- Journal
- Knowledge Base
- Backtesting
- Analytics
- Settings

---

# Components

## AI Components

- Chat Window
- Streaming Messages
- Suggested Questions
- Confidence Indicator
- Reasoning Timeline

## Trading Components

- TradingView Container
- HTF Bias Card
- LTF Checklist
- Risk Panel
- Session Timer

## Knowledge Components

- Document Viewer
- Search
- Markdown Editor
- Version History

---

# State Management

Global State:

- Active Symbol
- Active Timeframe
- AI Session
- Voice State
- Theme
- User Preferences

Server State:

- Journals
- Backtests
- Knowledge
- Conversations

---

# UX Goals

- One-click access to every tool.
- AI always visible.
- Charts remain the center of attention.
- Explanations are easy to read.
- No unnecessary popups.

---

# Accessibility

- Keyboard navigation
- Adjustable font size
- High contrast support
- Screen reader friendly where practical

---

# Long-Term Vision

The frontend should evolve into a complete Trading Operating System where charting, AI coaching, learning, journaling, and analytics coexist in one seamless experience.
