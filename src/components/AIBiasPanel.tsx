'use client'
import { useEffect, useState } from 'react'

const ASSETS = [
  { symbol: 'XAU/USD', name: 'Gold', base: 78, dir: 'BULLISH', color: '#f59e0b', reason: 'DXY weak, geopolitical tension, central bank buying' },
  { symbol: 'EUR/USD', name: 'Euro', base: 64, dir: 'BULLISH', color: '#10b981', reason: 'ECB hawkish stance, EUR demand rising' },
  { symbol: 'BTC/USD', name: 'Bitcoin', base: 61, dir: 'BULLISH', color: '#8b5cf6', reason: 'Risk-on sentiment, ETF inflows positive' },
  { symbol: 'ETH/USD', name: 'Ethereum', base: 55, dir: 'NEUTRAL', color: '#06b6d4', reason: 'Consolidation phase, waiting for catalyst' },
]

const LABELS: Record<string, string> = {
  BULLISH: 'text-emerald-400',
  BEARISH: 'text-red-400',
  NEUTRAL: 'text-yellow-400',
}

export default function AIBiasPanel() {
  const [biases, setBiases] = useState(ASSETS.map(a => ({ ...a, confidence: a.base })))

  useEffect(() => {
    const id = setInterval(() => {
      setBiases(prev => prev.map(b => ({
        ...b,
        confidence: Math.max(45, Math.min(95, b.confidence + (Math.random() - 0.49) * 2))
      })))
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="glass rounded-xl p-4 card-hover h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-semibold text-[#0ea5e9] uppercase tracking-widest">AI Market Bias</h2>
          <p className="text-[10px] text-slate-600 mt-0.5">Updated every 30s</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
          <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
        </div>
      </div>
      <div className="space-y-4">
        {biases.map((asset) => (
          <div key={asset.symbol} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: asset.color }} />
                <div>
                  <span className="text-xs font-mono font-semibold text-white">{asset.symbol}</span>
                  <span className="text-[9px] text-slate-600 ml-2">{asset.name}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-bold ${LABELS[asset.dir]}`}>{asset.dir}</span>
                <span className="text-[10px] text-slate-500 ml-2 font-mono">{Math.round(asset.confidence)}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${asset.confidence}%`, background: asset.color }}
              />
            </div>
            <p className="text-[9px] text-slate-600 leading-relaxed">{asset.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
