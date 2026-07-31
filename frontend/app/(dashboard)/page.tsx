"use client";

import React, { useState } from "react";
import TradingViewWidget from "@/components/TradingViewWidget";
import ChecklistPanel from "@/components/ChecklistPanel";
import ChatPanel from "@/components/ChatPanel";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function DashboardPage() {
  const [symbol, setSymbol] = useState("FX:EURUSD");
  const [htfBias, setHtfBias] = useState("BULLISH");
  const [checklistMap, setChecklistMap] = useState<Record<string, boolean>>({});

  const handleEvaluationChange = (evalResult: any, contextMap: Record<string, boolean>) => {
    setChecklistMap(contextMap);
  };

  const currentMarketContext = {
    symbol: symbol,
    htf_bias: htfBias,
    ...checklistMap,
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-surface p-3 rounded-xl border border-border flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <label className="text-[10px] text-gray-500 font-mono block">ACTIVE ASSET</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="bg-card border border-border rounded px-2.5 py-1 text-xs font-bold text-gray-200 focus:outline-none focus:border-accent"
            >
              <option value="FX:EURUSD">EUR/USD (Euro / US Dollar)</option>
              <option value="TVC:GOLD">XAU/USD (Gold)</option>
              <option value="FX:GBPUSD">GBP/USD (Cable)</option>
              <option value="BITSTAMP:BTCUSD">BTC/USD (Bitcoin)</option>
            </select>
          </div>

          <div className="h-8 w-px bg-border"></div>

          <div>
            <label className="text-[10px] text-gray-500 font-mono block">HTF BIAS (DAILY / 4H)</label>
            <div className="flex space-x-1.5 mt-0.5">
              <button
                onClick={() => setHtfBias("BULLISH")}
                className={`px-3 py-0.5 rounded text-xs font-bold flex items-center space-x-1 border ${
                  htfBias === "BULLISH"
                    ? "bg-success/20 text-success border-success/40"
                    : "bg-card text-gray-400 border-border"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>BULLISH</span>
              </button>
              <button
                onClick={() => setHtfBias("BEARISH")}
                className={`px-3 py-0.5 rounded text-xs font-bold flex items-center space-x-1 border ${
                  htfBias === "BEARISH"
                    ? "bg-danger/20 text-danger border-danger/40"
                    : "bg-card text-gray-400 border-border"
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>BEARISH</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] text-gray-500 font-mono block">RECOMMENDED MAX RISK</span>
            <span className="text-xs font-bold text-success font-mono">1.0% ($100 per trade)</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 font-mono block">MIN RR RATIO</span>
            <span className="text-xs font-bold text-accent font-mono">1 : 2.5</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Chart + Checklist, Right AI Copilot */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        <div className="col-span-8 flex flex-col space-y-4">
          <div className="flex-1 min-h-[350px]">
            <TradingViewWidget symbol={symbol} />
          </div>
          <div className="h-[220px]">
            <ChecklistPanel onEvaluationChange={handleEvaluationChange} />
          </div>
        </div>

        <div className="col-span-4 h-full">
          <ChatPanel marketContext={currentMarketContext} />
        </div>
      </div>
    </div>
  );
}
