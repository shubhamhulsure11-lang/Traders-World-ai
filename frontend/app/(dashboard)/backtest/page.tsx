"use client";

import React from "react";
import { BarChart3, TrendingUp, Award, Layers } from "lucide-react";

export default function BacktestPage() {
  return (
    <div className="space-y-4">
      <div className="bg-surface p-4 rounded-xl border border-border">
        <h1 className="text-lg font-bold text-white flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          <span>Backtesting & Strategy Statistics</span>
        </h1>
        <p className="text-xs text-gray-400">
          Historical probability engine feeding knowledge into the AI Copilot.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono">WIN RATE</span>
          <div className="text-2xl font-bold text-success font-mono">68.4%</div>
          <span className="text-[10px] text-gray-400">Sample size: 120 trades</span>
        </div>
        <div className="bg-surface border border-border p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono">AVG RISK REWARD</span>
          <div className="text-2xl font-bold text-accent font-mono">1 : 2.85</div>
          <span className="text-[10px] text-gray-400">Min required: 1:2.0</span>
        </div>
        <div className="bg-surface border border-border p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono">PROFIT FACTOR</span>
          <div className="text-2xl font-bold text-warning font-mono">2.41</div>
          <span className="text-[10px] text-gray-400">Gross Win / Gross Loss</span>
        </div>
        <div className="bg-surface border border-border p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono">MAX DRAWDOWN</span>
          <div className="text-2xl font-bold text-danger font-mono">-4.2%</div>
          <span className="text-[10px] text-gray-400">Max consecutive losses: 3</span>
        </div>
      </div>
    </div>
  );
}
