"use client";

import React, { useState } from "react";
import { BookOpen, RefreshCw, Database, FileText } from "lucide-react";

export default function KnowledgePage() {
  const [reindexing, setReindexing] = useState(false);
  const [status, setStatus] = useState("");

  const handleReindex = async () => {
    setReindexing(true);
    setStatus("Indexing strategy documents into ChromaDB...");
    try {
      const res = await fetch("http://localhost:8000/api/v1/knowledge/reindex", {
        method: "POST",
      });
      const data = await res.json();
      setStatus(`✅ Successfully indexed ${data.indexed_chunks} chunks into ChromaDB.`);
    } catch (e) {
      setStatus("⚠️ Failed to connect to backend reindex endpoint.");
    } finally {
      setReindexing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-surface p-4 rounded-xl border border-border">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-accent" />
            <span>AI Knowledge Base & RAG Index</span>
          </h1>
          <p className="text-xs text-gray-400">
            The permanent brain of Traders World AI — version-controlled markdown rules.
          </p>
        </div>

        <button
          onClick={handleReindex}
          disabled={reindexing}
          className="bg-accent hover:bg-accentHover text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${reindexing ? "animate-spin" : ""}`} />
          <span>{reindexing ? "Indexing..." : "Reindex Knowledge"}</span>
        </button>
      </div>

      {status && (
        <div className="bg-card border border-border p-3 rounded-xl text-xs font-mono text-accent">
          {status}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border p-4 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-accent font-semibold text-xs">
            <FileText className="w-4 h-4" />
            <span>Strategy Docs</span>
          </div>
          <p className="text-xs text-gray-400">01_htf_bias.md, market_structure.md, liquidity.md</p>
        </div>
        <div className="bg-surface border border-border p-4 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-accent font-semibold text-xs">
            <Database className="w-4 h-4" />
            <span>Vector Store</span>
          </div>
          <p className="text-xs text-gray-400">ChromaDB Local Engine (Cosine Space)</p>
        </div>
        <div className="bg-surface border border-border p-4 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-accent font-semibold text-xs">
            <BookOpen className="w-4 h-4" />
            <span>Rule Files</span>
          </div>
          <p className="text-xs text-gray-400">rule_01.md, rule_02.md, rule_03.md ...</p>
        </div>
      </div>
    </div>
  );
}
