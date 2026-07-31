"use client";

import React from "react";
import { Activity, Shield, Cpu, Clock } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 z-20 shrink-0">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-white shadow-lg shadow-accent/30">
          TW
        </div>
        <span className="font-bold text-lg text-white tracking-wide">
          TRADERS WORLD <span className="text-accent">AI</span>
        </span>
        <span className="px-2 py-0.5 text-xs bg-card border border-border text-gray-400 rounded-md font-mono">
          v1.0.0
        </span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
          <Clock className="w-3.5 h-3.5 text-accent" />
          <span>LONDON / NY SESSION</span>
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-card border border-border px-3 py-1.5 rounded-lg text-gray-300">
          <Cpu className="w-3.5 h-3.5 text-success" />
          <span>Gemini 1.5 Flash</span>
          <span className="text-success font-semibold">Active</span>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-card border border-border px-3 py-1.5 rounded-lg text-gray-300">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span>SMC Ruleset: Enforced</span>
        </div>
      </div>
    </header>
  );
}
