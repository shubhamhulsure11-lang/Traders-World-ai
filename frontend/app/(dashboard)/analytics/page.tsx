"use client";

import React, { useState, useEffect } from "react";
import { Brain, Award, ShieldAlert, Zap, TrendingUp, BarChart3 } from "lucide-react";

interface AnalyticsData {
  total_trades: number;
  win_rate: number;
  avg_rr: number;
  profit_factor: number;
  max_drawdown: number;
  discipline_score: number;
  fomo_count: number;
  revenge_count: number;
  session_stats: { london: number; newyork: number; asian: number };
  quality_breakdown: { aplus: number; b: number; c: number; fomo: number };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("http://localhost:8000/api/v1/analytics/");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to fetch analytics:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-surface p-4 rounded-xl border border-border">
        <h1 className="text-lg font-bold text-white flex items-center space-x-2">
          <Brain className="w-5 h-5 text-accent" />
          <span>Trading Psychology & Discipline Analytics (Live DB Metrics)</span>
        </h1>
        <p className="text-xs text-gray-400">
          Computed in real-time from database trades and session logs.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-xs italic">
          Calculating performance metrics from database...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-surface border border-border p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 font-mono">DISCIPLINE SCORE</span>
              <div className="text-2xl font-bold text-success font-mono">
                {data?.discipline_score ?? 100}%
              </div>
              <span className="text-[10px] text-gray-400">
                A+ setups ratio ({data?.quality_breakdown?.aplus || 0}/{data?.total_trades || 0})
              </span>
            </div>

            <div className="bg-surface border border-border p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 font-mono">WIN RATE</span>
              <div className="text-2xl font-bold text-accent font-mono">
                {data?.win_rate ?? 0}%
              </div>
              <span className="text-[10px] text-gray-400">Total Trades: {data?.total_trades || 0}</span>
            </div>

            <div className="bg-surface border border-border p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 font-mono">PROFIT FACTOR</span>
              <div className="text-2xl font-bold text-warning font-mono">
                {data?.profit_factor ?? 0}
              </div>
              <span className="text-[10px] text-gray-400">Gross Win / Gross Loss</span>
            </div>

            <div className="bg-surface border border-border p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-gray-500 font-mono">ESTIMATED MAX DRAWDOWN</span>
              <div className="text-2xl font-bold text-danger font-mono">
                -{data?.max_drawdown ?? 0}%
              </div>
              <span className="text-[10px] text-gray-400">Consecutive loss exposure</span>
            </div>
          </div>

          {/* Psychology & Discipline Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface border border-border p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2 border-b border-border pb-2">
                <ShieldAlert className="w-4 h-4 text-warning" />
                <span>Emotional Violations & FOMO Tracking</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-card p-3 rounded-lg border border-border">
                  <span className="text-[10px] text-gray-400 font-mono block mb-1">FOMO SETUPS LOGGED</span>
                  <span className="text-xl font-bold text-warning font-mono">
                    {data?.fomo_count || 0} Trades
                  </span>
                </div>
                <div className="bg-card p-3 rounded-lg border border-border">
                  <span className="text-[10px] text-gray-400 font-mono block mb-1">FORCED / REVENGE TRADES</span>
                  <span className="text-xl font-bold text-danger font-mono">
                    {data?.revenge_count || 0} Trades
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2 border-b border-border pb-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                <span>Trading Session Performance Distribution</span>
              </h3>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                <div className="bg-card p-2.5 rounded-lg border border-border">
                  <span className="text-[10px] text-gray-400 block">LONDON</span>
                  <span className="text-lg font-bold text-accent">{data?.session_stats?.london || 0}</span>
                </div>
                <div className="bg-card p-2.5 rounded-lg border border-border">
                  <span className="text-[10px] text-gray-400 block">NEW YORK</span>
                  <span className="text-lg font-bold text-success">{data?.session_stats?.newyork || 0}</span>
                </div>
                <div className="bg-card p-2.5 rounded-lg border border-border">
                  <span className="text-[10px] text-gray-400 block">ASIAN</span>
                  <span className="text-lg font-bold text-warning">{data?.session_stats?.asian || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
