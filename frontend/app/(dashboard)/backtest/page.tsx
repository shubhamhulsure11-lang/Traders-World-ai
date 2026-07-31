"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Play, History, Award, Layers, Sparkles } from "lucide-react";

interface BacktestRecord {
  id: string;
  strategy_name: string;
  sample_size: number;
  win_rate: number;
  avg_rr: number;
  profit_factor: number;
  max_drawdown: number;
  expectancy: number;
  notes?: string;
  created_at?: string;
}

export default function BacktestPage() {
  const [backtests, setBacktests] = useState<BacktestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const fetchBacktests = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/backtests/");
      if (res.ok) {
        const data = await res.json();
        setBacktests(data);
      }
    } catch (e) {
      console.error("Failed to fetch backtests:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacktests();
  }, []);

  const handleRunBacktest = async () => {
    setRunning(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/backtests/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy_name: "Smart Money Concepts — SMC 8-Rule System",
          notes: "Calculated over logged trades in SQLite database.",
        }),
      });
      if (res.ok) {
        await fetchBacktests();
      }
    } catch (e) {
      console.error("Failed to run backtest:", e);
    } finally {
      setRunning(false);
    }
  };

  const latest = backtests.length > 0 ? backtests[0] : null;

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-border">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            <span>Backtesting & Strategy Statistics (Live Database Engine)</span>
          </h1>
          <p className="text-xs text-gray-400">
            Historical probability engine feeding knowledge into the AI Copilot.
          </p>
        </div>

        <button
          onClick={handleRunBacktest}
          disabled={running}
          className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50 shadow-lg shadow-accent/20"
        >
          <Play className={`w-4 h-4 ${running ? "animate-spin" : ""}`} />
          <span>{running ? "Calculating Probabilities..." : "Run New Backtest"}</span>
        </button>
      </div>

      {/* Main Metrics Card */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono">WIN RATE</span>
          <div className="text-2xl font-bold text-success font-mono">
            {latest?.win_rate ?? 0}%
          </div>
          <span className="text-[10px] text-gray-400">
            Sample size: {latest?.sample_size ?? 0} trades
          </span>
        </div>
        <div className="bg-surface border border-border p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono">AVG RISK REWARD</span>
          <div className="text-2xl font-bold text-accent font-mono">
            1 : {latest?.avg_rr ?? 0}
          </div>
          <span className="text-[10px] text-gray-400">Expectancy: +{latest?.expectancy ?? 0}R</span>
        </div>
        <div className="bg-surface border border-border p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono">PROFIT FACTOR</span>
          <div className="text-2xl font-bold text-warning font-mono">
            {latest?.profit_factor ?? 0}
          </div>
          <span className="text-[10px] text-gray-400">Gross Win / Gross Loss</span>
        </div>
        <div className="bg-surface border border-border p-4 rounded-xl space-y-1">
          <span className="text-[10px] text-gray-500 font-mono">MAX DRAWDOWN</span>
          <div className="text-2xl font-bold text-danger font-mono">
            {latest?.max_drawdown ?? 0}%
          </div>
          <span className="text-[10px] text-gray-400">Historical peak-to-trough</span>
        </div>
      </div>

      {/* Backtest History Table */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-white flex items-center space-x-2 border-b border-border pb-2">
          <History className="w-4 h-4 text-accent" />
          <span>Historical Backtest Runs ({backtests.length})</span>
        </h3>

        {loading ? (
          <div className="text-center py-6 text-xs text-gray-400 italic">
            Fetching backtest records...
          </div>
        ) : backtests.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400 space-y-2">
            <p>No backtest runs saved in database yet.</p>
            <button
              onClick={handleRunBacktest}
              className="text-accent underline font-semibold"
            >
              Run backtest over logged trades
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-gray-400 text-[10px] uppercase">
                  <th className="py-2">Strategy</th>
                  <th className="py-2">Sample</th>
                  <th className="py-2">Win Rate</th>
                  <th className="py-2">Avg RR</th>
                  <th className="py-2">Profit Factor</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-gray-200">
                {backtests.map((b) => (
                  <tr key={b.id} className="hover:bg-card/40">
                    <td className="py-2.5 font-sans font-medium text-white">{b.strategy_name}</td>
                    <td className="py-2.5">{b.sample_size} trades</td>
                    <td className="py-2.5 text-success font-bold">{b.win_rate}%</td>
                    <td className="py-2.5 text-accent font-bold">1:{b.avg_rr}</td>
                    <td className="py-2.5 text-warning font-bold">{b.profit_factor}</td>
                    <td className="py-2.5 text-gray-400 text-[11px]">
                      {b.created_at ? new Date(b.created_at).toLocaleDateString() : "Recent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
