"use client";

import React from "react";
import { Brain, HeartPulse, Zap, ShieldAlert } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <div className="bg-surface p-4 rounded-xl border border-border">
        <h1 className="text-lg font-bold text-white flex items-center space-x-2">
          <Brain className="w-5 h-5 text-accent" />
          <span>Trading Psychology & Discipline Analytics</span>
        </h1>
        <p className="text-xs text-gray-400">
          Tracking emotional mistakes, FOMO count, and strategy adherence over time.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border p-4 rounded-xl space-y-2">
          <span className="text-[10px] text-gray-500 font-mono">DISCIPLINE SCORE</span>
          <div className="text-3xl font-bold text-success font-mono">92 / 100</div>
          <p className="text-xs text-gray-400">Rules followed on 92% of trades</p>
        </div>
        <div className="bg-surface border border-border p-4 rounded-xl space-y-2">
          <span className="text-[10px] text-gray-500 font-mono">FOMO TRADES FLAGGED</span>
          <div className="text-3xl font-bold text-warning font-mono">2 Trades</div>
          <p className="text-xs text-gray-400">Intercepted by AI Coach before entry</p>
        </div>
        <div className="bg-surface border border-border p-4 rounded-xl space-y-2">
          <span className="text-[10px] text-gray-500 font-mono">REVENGE TRADES PREVENTED</span>
          <div className="text-3xl font-bold text-accent font-mono">5 Attempted</div>
          <p className="text-xs text-gray-400">Cooldown period enforced</p>
        </div>
      </div>
    </div>
  );
}
