"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, AlertCircle, Sparkles } from "lucide-react";

const initialChecklist = [
  { id: "htf_bias_confirmed", label: "Rule 01: Higher Timeframe Bias confirmed", checked: false },
  { id: "aplus_zone_reached", label: "Rule 02: Price at A+ Key Zone", checked: false },
  { id: "liquidity_swept", label: "Rule 03: Liquidity sweep completed", checked: false },
  { id: "structure_shifted", label: "Rule 04: LTF Structure Shift (BOS/ChoCH)", checked: false },
  { id: "confirmation_formed", label: "Rule 05: Confirmation candle formed", checked: false },
  { id: "stop_loss_defined", label: "Rule 06: Logical Stop Loss defined", checked: false },
  { id: "risk_acceptable", label: "Rule 07: Risk <= 2% & RR >= 1:2", checked: false },
  { id: "target_identified", label: "Rule 08: Take Profit target set", checked: false },
];

interface ChecklistPanelProps {
  onEvaluationChange?: (evalResult: any, contextMap: Record<string, boolean>) => void;
}

export default function ChecklistPanel({ onEvaluationChange }: ChecklistPanelProps) {
  const [items, setItems] = useState(initialChecklist);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);

  const evaluateMarketContext = async (currentItems: typeof initialChecklist) => {
    const marketContextMap: Record<string, boolean> = {};
    currentItems.forEach((item) => {
      marketContextMap[item.id] = item.checked;
    });

    setEvaluating(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/strategy/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market_context: marketContextMap }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvaluation(data);
        if (onEvaluationChange) {
          onEvaluationChange(data, marketContextMap);
        }
      }
    } catch (e) {
      console.warn("Failed to evaluate strategy with backend API", e);
    } finally {
      setEvaluating(false);
    }
  };

  const toggle = (id: string) => {
    const nextItems = items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item));
    setItems(nextItems);
    evaluateMarketContext(nextItems);
  };

  useEffect(() => {
    evaluateMarketContext(items);
  }, []);

  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-sm text-gray-200">A+ Pre-Trade Checklist</h3>
          {evaluating && <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" />}
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
            evaluation?.verdict === "valid"
              ? "bg-success/20 text-success border border-success/30"
              : evaluation?.verdict === "incomplete"
              ? "bg-warning/20 text-warning border border-warning/30"
              : "bg-danger/20 text-danger border border-danger/30"
          }`}
        >
          {checkedCount}/{items.length} Rules ({evaluation?.verdict?.toUpperCase() || "EVALUATING"})
        </span>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto pr-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className={`w-full flex items-center space-x-3 p-2.5 rounded-lg border text-left text-xs transition-all ${
              item.checked
                ? "bg-success/10 border-success/30 text-gray-200"
                : "bg-card/40 border-border text-gray-400 hover:border-gray-600"
            }`}
          >
            {item.checked ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-500 shrink-0" />
            )}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        {evaluation?.verdict === "valid" ? (
          <div className="bg-success/15 border border-success/30 text-success rounded-lg p-2.5 text-xs text-center font-medium">
            ✅ Strategy Engine: Setup Validated (Confidence: {evaluation.confidence.toUpperCase()})
          </div>
        ) : (
          <div className="bg-warning/15 border border-warning/30 text-warning rounded-lg p-2.5 text-xs text-center font-medium flex items-center justify-center space-x-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Setup Incomplete — Missing: {evaluation?.rules_missing?.length || 0} Rule(s)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
