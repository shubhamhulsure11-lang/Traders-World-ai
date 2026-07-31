"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  BookOpen,
  BookMarked,
  BarChart3,
  Brain,
  Settings,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Voice Copilot", href: "/voice", icon: Mic },
  { name: "Trade Journal", href: "/journal", icon: BookMarked },
  { name: "Backtesting", href: "/backtest", icon: BarChart3 },
  { name: "Knowledge Base", href: "/knowledge", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: Brain },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-surface border-r border-border flex flex-col justify-between p-3 shrink-0">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-gray-400 hover:text-gray-200 hover:bg-card/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-gray-400"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-border">
        <div className="p-3 bg-card/60 rounded-xl border border-border">
          <div className="text-xs font-semibold text-gray-300">Methodology</div>
          <div className="text-xs text-gray-500 mt-0.5">Smart Money Concepts</div>
          <div className="mt-2 text-[11px] text-accent flex items-center space-x-1 font-mono">
            <span>● 8 Core Rules Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
