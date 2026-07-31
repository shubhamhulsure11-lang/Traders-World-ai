"use client";

import React, { useState, useEffect } from "react";
import {
  BookMarked,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  X,
} from "lucide-react";

interface Trade {
  id: string;
  symbol: string;
  direction: string;
  entry_price?: number;
  stop_loss?: number;
  take_profit?: number;
  result?: string;
  setup_quality?: string;
  notes?: string;
  r_multiple?: number;
  lessons?: string;
  created_at?: string;
}

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDirection, setFilterDirection] = useState("");
  const [filterQuality, setFilterQuality] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Form state
  const [formSymbol, setFormSymbol] = useState("EURUSD");
  const [formDirection, setFormDirection] = useState("long");
  const [formEntry, setFormEntry] = useState("");
  const [formSL, setFormSL] = useState("");
  const [formTP, setFormTP] = useState("");
  const [formResult, setFormResult] = useState("win");
  const [formQuality, setFormQuality] = useState("aplus");
  const [formNotes, setFormNotes] = useState("");

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterDirection) params.append("direction", filterDirection);
      if (filterQuality) params.append("setup_quality", filterQuality);

      const res = await fetch(`http://localhost:8000/api/v1/journal/?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTrades(data);
      }
    } catch (e) {
      console.error("Error fetching trades:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [search, filterDirection, filterQuality]);

  const handleCreateTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/journal/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: formSymbol,
          direction: formDirection,
          entry_price: formEntry ? parseFloat(formEntry) : null,
          stop_loss: formSL ? parseFloat(formSL) : null,
          take_profit: formTP ? parseFloat(formTP) : null,
          result: formResult,
          setup_quality: formQuality,
          notes: formNotes,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormNotes("");
        fetchTrades();
      }
    } catch (err) {
      console.error("Failed to create trade", err);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/journal/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTrades();
      }
    } catch (err) {
      console.error("Failed to delete trade", err);
    }
  };

  const handleAiReview = async (id: string) => {
    setReviewingId(id);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/journal/${id}/ai-review`, {
        method: "POST",
      });
      if (res.ok) {
        fetchTrades();
      }
    } catch (err) {
      console.error("Failed to generate AI review", err);
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-border">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center space-x-2">
            <BookMarked className="w-5 h-5 text-accent" />
            <span>Trade Journal (Live Database)</span>
          </h1>
          <p className="text-xs text-gray-400">
            Every trade is stored in SQLite DB and analyzed by the AI Strategy Engine.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-accentHover text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-lg shadow-accent/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface p-3 rounded-xl border border-border flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-md bg-card border border-border px-3 py-1.5 rounded-lg text-xs">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by symbol or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
            className="bg-card border border-border text-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
          >
            <option value="">All Directions</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>

          <select
            value={filterQuality}
            onChange={(e) => setFilterQuality(e.target.value)}
            className="bg-card border border-border text-gray-300 rounded px-2.5 py-1.5 focus:outline-none"
          >
            <option value="">All Qualities</option>
            <option value="aplus">A+ Setup</option>
            <option value="b">B Setup</option>
            <option value="c">C Setup</option>
            <option value="fomo">FOMO Setup</option>
          </select>
        </div>
      </div>

      {/* Trades Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-xs italic">
          Loading journal entries from database...
        </div>
      ) : trades.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-gray-400 text-xs space-y-3">
          <BookMarked className="w-8 h-8 text-accent mx-auto opacity-50" />
          <p>No trade journal entries found in database.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-accent underline font-semibold"
          >
            Create your first entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trades.map((t) => (
            <div key={t.id} className="bg-surface border border-border rounded-xl p-4 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-white font-mono">{t.symbol}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      t.direction === "long"
                        ? "bg-success/20 text-success"
                        : "bg-danger/20 text-danger"
                    }`}
                  >
                    {t.direction}
                  </span>
                  <span className="text-[10px] bg-card px-2 py-0.5 rounded border border-border text-gray-300 uppercase font-mono">
                    {t.setup_quality} Setup
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-bold font-mono uppercase ${
                      t.result === "win"
                        ? "text-success"
                        : t.result === "loss"
                        ? "text-danger"
                        : "text-gray-400"
                    }`}
                  >
                    {t.result} {t.r_multiple != null ? `(${t.r_multiple > 0 ? `+${t.r_multiple}` : t.r_multiple}R)` : ""}
                  </span>

                  <button
                    onClick={() => handleDeleteTrade(t.id)}
                    className="text-gray-500 hover:text-danger p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {t.notes && (
                <p className="text-xs text-gray-300 bg-card/40 p-2.5 rounded-lg border border-border/50">
                  {t.notes}
                </p>
              )}

              {/* AI Lessons Section */}
              {t.lessons ? (
                <div className="bg-accent/10 border border-accent/30 rounded-lg p-2.5 text-xs space-y-1">
                  <div className="flex items-center space-x-1 text-accent font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Trade Critique</span>
                  </div>
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed text-[11px]">
                    {t.lessons}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => handleAiReview(t.id)}
                  disabled={reviewingId === t.id}
                  className="w-full bg-card hover:bg-card/80 border border-border text-accent text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${reviewingId === t.id ? "animate-spin" : ""}`} />
                  <span>{reviewingId === t.id ? "Generating Critique..." : "Generate AI Trade Review"}</span>
                </button>
              )}

              <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 font-mono">
                <span>Created: {t.created_at ? new Date(t.created_at).toLocaleDateString() : "Recently"}</span>
                {t.entry_price && <span>Entry: ${t.entry_price}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Journal Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border w-full max-w-md rounded-xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-accent" />
                <span>New Trade Journal Entry</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTrade} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-mono">SYMBOL</label>
                  <input
                    type="text"
                    required
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    className="w-full bg-card border border-border rounded p-2 text-white font-mono uppercase focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-mono">DIRECTION</label>
                  <select
                    value={formDirection}
                    onChange={(e) => setFormDirection(e.target.value)}
                    className="w-full bg-card border border-border rounded p-2 text-white focus:border-accent"
                  >
                    <option value="long">LONG</option>
                    <option value="short">SHORT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1 font-mono">ENTRY</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="1.0850"
                    value={formEntry}
                    onChange={(e) => setFormEntry(e.target.value)}
                    className="w-full bg-card border border-border rounded p-2 text-white font-mono focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-mono">STOP LOSS</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="1.0820"
                    value={formSL}
                    onChange={(e) => setFormSL(e.target.value)}
                    className="w-full bg-card border border-border rounded p-2 text-white font-mono focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-mono">TAKE PROFIT</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="1.0950"
                    value={formTP}
                    onChange={(e) => setFormTP(e.target.value)}
                    className="w-full bg-card border border-border rounded p-2 text-white font-mono focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 block mb-1 font-mono">RESULT</label>
                  <select
                    value={formResult}
                    onChange={(e) => setFormResult(e.target.value)}
                    className="w-full bg-card border border-border rounded p-2 text-white focus:border-accent"
                  >
                    <option value="win">WIN</option>
                    <option value="loss">LOSS</option>
                    <option value="breakeven">BREAKEVEN</option>
                    <option value="open">OPEN</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-mono">SETUP QUALITY</label>
                  <select
                    value={formQuality}
                    onChange={(e) => setFormQuality(e.target.value)}
                    className="w-full bg-card border border-border rounded p-2 text-white focus:border-accent"
                  >
                    <option value="aplus">A+ Setup</option>
                    <option value="b">B Setup</option>
                    <option value="c">C Setup</option>
                    <option value="fomo">FOMO Setup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-mono">TRADE NOTES / SMC REASONING</label>
                <textarea
                  rows={3}
                  placeholder="Sweep of 4H demand zone, 1m ChoCH engulfing confirmation..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-card border border-border rounded p-2 text-white focus:border-accent"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-card hover:bg-card/80 text-gray-300 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-accent hover:bg-accentHover text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-accent/20"
                >
                  Save Entry to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
