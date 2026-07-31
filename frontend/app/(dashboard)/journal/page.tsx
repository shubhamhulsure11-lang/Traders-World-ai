"use client";

import React, { useState } from "react";
import { Plus, BookMarked, CheckCircle, AlertTriangle } from "lucide-react";

export default function JournalPage() {
  const [trades, setTrades] = useState([
    {
      id: "1",
      symbol: "EURUSD",
      direction: "LONG",
      setup_quality: "A+",
      result: "WIN",
      r_multiple: 3.2,
      notes: "HTF demand zone sweep on 4H. ChoCH on 1m with engulfing confirmation.",
      date: "2026-07-30",
    },
    {
      id: "2",
      symbol: "XAUUSD",
      direction: "SHORT",
      setup_quality: "FOMO",
      result: "LOSS",
      r_multiple: -1.0,
      notes: "Entered early before 1m confirmation candle closed. Violates Rule 02.",
      date: "2026-07-29",
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-border">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center space-x-2">
            <BookMarked className="w-5 h-5 text-accent" />
            <span>Trade Journal</span>
          </h1>
          <p className="text-xs text-gray-400">
            Every trade is indexed into the AI Knowledge Base to improve coaching.
          </p>
        </div>

        <button className="bg-accent hover:bg-accentHover text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trades.map((t) => (
          <div key={t.id} className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white font-mono">{t.symbol}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    t.direction === "LONG"
                      ? "bg-success/20 text-success"
                      : "bg-danger/20 text-danger"
                  }`}
                >
                  {t.direction}
                </span>
                <span className="text-[10px] bg-card px-2 py-0.5 rounded border border-border text-gray-400">
                  {t.setup_quality} Setup
                </span>
              </div>

              <span
                className={`text-xs font-bold font-mono ${
                  t.result === "WIN" ? "text-success" : "text-danger"
                }`}
              >
                {t.result} ({t.r_multiple > 0 ? `+${t.r_multiple}R` : `${t.r_multiple}R`})
              </span>
            </div>

            <p className="text-xs text-gray-300 bg-card/40 p-2.5 rounded-lg border border-border/50">
              {t.notes}
            </p>

            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
              <span>{t.date}</span>
              <span className="text-accent hover:underline cursor-pointer">AI Analysis Attached</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
