"use client";

import React, { useState } from "react";
import { Send, Bot, User, Sparkles, BookOpen } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
  citations?: any[];
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello! I am Traders World AI — your AI Trading Copilot. I know your Smart Money Concepts methodology. What setup or concept would you like to review?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, conversation_id: "default_conv" }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.text,
          citations: data.citations,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Connection error to AI backend. Make sure FastAPI server is running on http://localhost:8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between bg-card/40">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-accent" />
          <span className="font-semibold text-xs text-gray-200">AI Copilot</span>
        </div>
        <span className="text-[10px] font-mono bg-accent/10 text-accent px-2 py-0.5 rounded border border-accent/20">
          RAG Enabled
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex space-x-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                m.role === "user"
                  ? "bg-accent text-white"
                  : "bg-card border border-border text-gray-200"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {m.citations && m.citations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-border/60 text-[10px] text-gray-400 space-y-1">
                  <div className="flex items-center space-x-1 font-semibold text-accent">
                    <BookOpen className="w-3 h-3" />
                    <span>CITED SOURCES:</span>
                  </div>
                  {m.citations.map((c, idx) => (
                    <div key={idx} className="bg-background/50 px-2 py-1 rounded font-mono border border-border/40">
                      • {c.label} ({c.source})
                    </div>
                  ))}
                </div>
              )}
            </div>

            {m.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center text-gray-400 shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-gray-400 text-xs italic">
            <Sparkles className="w-4 h-4 text-accent animate-spin" />
            <span>AI Copilot is evaluating strategy rules...</span>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t border-border bg-card/20 flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI about setups, rules, HTF bias, or concepts..."
          className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-accent hover:bg-accentHover text-white px-3.5 py-2 rounded-lg font-medium text-xs flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
