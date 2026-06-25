'use client'
import { useEffect, useState } from 'react'

const PAIRS = [
  { pair: 'Gold vs DXY', base: -0.82, regime: 'Strong Inverse' },
  { pair: 'Gold vs US10Y', base: -0.74, regime: 'Inverse' },
  { pair: 'BTC vs Nasdaq', base: 0.68, regime: 'Positive' },
  { pair: 'EUR/USD vs DXY', base: -0.91, regime: 'Strong Inverse' },
  { pair: 'Gold vs VIX', base: 0.61, regime: 'Positive' },
]

function corrColor(val: number): string {
  if (val <= -0.7) return '#ef4444'
  if (val < -0.3) return '#f97316'
  if (val < 0.3) return '#94a3b8'
  if (val < 0.7) return '#10b981'
  return '#22c55e'
}

export default function CorrelationPanel() {
  const [corrs, setCorrs] = useState(PAIRS.map(p => ({ ...p, value: p.base })))

  useEffect(() => {
    const id = setInterval(() => {
      setCorrs(prev => prev.map(c => ({
        ...c,
        value: Math.max(-1, Math.min(1, c.value + (Math.random() - 0.5) * 0.02))
      })))
    }, 8000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="glass rounded-xl p-4 card-hover">
      <div className="mb-3">
        <h2 className="text-xs font-semibold text-[#0ea5e9] uppercase tracking-widest">Correlations</h2>
        <p className="text-[10px] text-slate-600 mt-0.5">Rolling 4H window</p>
      </div>
      <div className="space-y-2.5">
        {corrs.map(c => (
          <div key={c.pair}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-400">{c.pair}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-600">{c.regime}</span>
                <span className="text-[10px] font-mono font-bold" style={{ color: corrColor(c.value) }}>
                  {c.value.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 left-1/2 w-px bg-slate-700" />
              <div
                className="h-full rounded-full transition-all duration-1000 absolute"
                style={{
                  background: corrColor(c.value),
                  width: `${Math.abs(c.value) * 50}%`,
                  left: c.value < 0 ? `${50 - Math.abs(c.value) * 50}%` : '50%'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
