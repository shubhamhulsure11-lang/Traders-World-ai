"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, LogIn, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-md space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent mx-auto">
            <Bot className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white">Welcome Back</h1>
          <p className="text-xs text-gray-400">Sign in to access your Traders World AI Copilot</p>
        </div>

        {error && (
          <div className="bg-danger/15 border border-danger/30 text-danger text-xs p-3 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-gray-400 block mb-1 font-mono">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              placeholder="trader@tradersworld.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card border border-border rounded-lg p-2.5 text-white focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-gray-400 block mb-1 font-mono">PASSWORD</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-card border border-border rounded-lg p-2.5 text-white focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accentHover text-white py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 shadow-lg shadow-accent/20"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? "Signing in..." : "Sign In to Copilot"}</span>
          </button>
        </form>

        <div className="text-center text-xs text-gray-400 pt-2 border-t border-border">
          Don't have an account?{" "}
          <Link href="/register" className="text-accent underline font-semibold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
