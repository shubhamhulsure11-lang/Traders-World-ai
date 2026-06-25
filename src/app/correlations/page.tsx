'use client'
import { useState } from 'react'

const ASSETS = ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTC-USD', 'US100', 'USDJPY', 'USDCHF']

// Rolling correlation matrix (simulated — in production, computed from price data)
const CORR_MATRIX: Record<string, Record<string, number>> = {
  XAUUSD:  { XAUUSD: 1.00, EURUSD: 0.72, GBPUSD: 0.65, 'BTC-USD': 0.41, US100: 0.38, USDJPY: -0.58, USDCHF: -0.63 },
  EURUSD:  { XAUUSD: 0.72, EURUSD: 1.00, GBPUSD: 0.88, 'BTC-USD': 0.29, US100: 0.44, USDJPY: -0.71, USDCHF: -0.82 },
  GBPUSD:  { XAUUSD: 0.65, EURUSD: 0.88, GBPUSD: 1.00, 'BTC-USD': 0.22, US100: 0.39, USDJPY: -0.66, USDCHF: -0.75 },
  'BTC-USD': { XAUUSD: 0.41, EURUSD: 0.29, GBPUSD: 0.22, 'BTC-USD': 1.00, US100: 0.67, USDJPY: -0.19, USDCHF: -0.24 },
  US100:   { XAUUSD: 0.38, EURUSD: 0.44, GBPUSD: 0.39, 'BTC-USD': 0.67, US100: 1.00, USDJPY: -0.33, USDCHF: -0.41 },
  USDJPY:  { XAUUSD: -0.58, EURUSD: -0.71, GBPUSD: -0.66, 'BTC-USD': -0.19, US100: -0.33, USDJPY: 1.00, USDCHF: 0.69 },
  USDCHF:  { XAUUSD: -0.63, EURUSD: -0.82, GBPUSD: -0.75, 'BTC-USD': -0.24, US100: -0.41, USDJPY: 0.69, USDCHF: 1.00 },
}

const KEY_PAIRS = [
  { a: 'XAUUSD', b: 'EURUSD', corr: 0.72, note: 'Gold & Euro move together — USD weakness driver' },
  { a: 'EURUSD', b: 'GBPUSD', corr: 0.88, note: 'Strong positive — both inversely tied to USD strength' },
  { a: 'BTC-USD', b: 'US100', corr: 0.67, note: 'Risk-on correlation — tech and crypto move in tandem' },
  { a: 'XAUUSD', b: 'USDJPY', corr: -0.58, note: 'Negative — safe haven gold vs risk-on Yen' },
  { a: 'EURUSD', b: 'USDCHF', corr: -0.82, note: 'Classic inverse — EUR/USD up = USD/CHF down' },
  { a: 'XAUUSD', b: 'USDCHF', corr: -0.63, note: 'Both safe havens but inverse USD relationship' },
]

function corrColor(v: number) {
  if (v >= 0.7) return 'bg-emerald-500'
  if (v >= 0.4) return 'bg-emerald-400/60'
  if (v >= 0.1) return 'bg-emerald-300/30'
  if (v >= -0.1) return 'bg-slate-600'
  if (v >= -0.4) return 'bg-red-300/30'
  if (v >= -0.7) return 'bg-red-400/60'
  return 'bg-red-500'
}

function corrTextColor(v: number) {
  if (Math.abs(v) >= 0.7) return 'text-white font-bold'
  if (Math.abs(v) >= 0.4) return 'text-slate-200'
  return 'text-slate-500'
}

export default function CorrelationsPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [window, setWindow] = useState<'30D' | '14D' | '7D'>('30D')

  const filteredKey = selected
    ? KEY_PAIRS.filter(p => p.a === selected || p.b === selected)
    : KEY_PAIRS

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Correlation Matrix</h1>
          <p className="text-xs text-slate-500 mt-0.5">Rolling cross-asset correlations — institutional grade</p>
        </div>
        <div className="flex gap-2">
          {(['30D', '14D', '7D'] as const).map(w => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                window === w ? 'bg-[#0ea5e9] text-black' : 'glass border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Grid */}
      <div className="glass rounded-xl p-4 border border-white/5 overflow-x-auto">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Correlation Heatmap</h2>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left text-slate-600 font-medium pb-2 pr-2 w-16"></th>
              {ASSETS.map(a => (
                <th key={a} className="pb-2 px-1 text-center">
                  <span
                    onClick={() => setSelected(selected === a ? null : a)}
                    className={`cursor-pointer text-[10px] font-semibold transition-colors ${
                      selected === a ? 'text-[#0ea5e9]' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {a.replace('-USD', '')}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ASSETS.map(rowA => (
              <tr key={rowA}>
                <td
                  onClick={() => setSelected(selected === rowA ? null : rowA)}
                  className={`text-[10px] font-semibold pr-2 py-0.5 cursor-pointer transition-colors ${
                    selected === rowA ? 'text-[#0ea5e9]' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {rowA.replace('-USD', '')}
                </td>
                {ASSETS.map(colA => {
                  const v = CORR_MATRIX[rowA]?.[colA] ?? 0
                  const isHighlighted = !selected || selected === rowA || selected === colA
                  return (
                    <td key={colA} className="px-1 py-0.5">
                      <div
                        className={`w-12 h-7 rounded flex items-center justify-center transition-all ${
                          corrColor(v)
                        } ${!isHighlighted ? 'opacity-20' : ''}`}
                      >
                        <span className={`text-[10px] ${corrTextColor(v)}`}>
                          {v.toFixed(2)}
                        </span>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
          <span className="text-[10px] text-slate-600">Legend:</span>
          {[
            { color: 'bg-emerald-500', label: 'Strong +' },
            { color: 'bg-emerald-400/60', label: 'Moderate +' },
            { color: 'bg-slate-600', label: 'Neutral' },
            { color: 'bg-red-400/60', label: 'Moderate -' },
            { color: 'bg-red-500', label: 'Strong -' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${l.color}`}></div>
              <span className="text-[10px] text-slate-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Pairs */}
      <div className="glass rounded-xl p-4 border border-white/5">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Key Correlated Pairs {selected && <span className="text-[#0ea5e9]">| {selected}</span>}
        </h2>
        <div className="space-y-3">
          {filteredKey.map(pair => (
            <div key={`${pair.a}-${pair.b}`} className="flex items-center gap-4 p-3 rounded-lg bg-white/2 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2 w-36 shrink-0">
                <span className="text-xs font-bold text-white">{pair.a}</span>
                <span className="text-slate-600">/</span>
                <span className="text-xs font-bold text-white">{pair.b}</span>
              </div>
              <div className="flex items-center gap-2 w-20 shrink-0">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      pair.corr > 0 ? 'bg-emerald-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.abs(pair.corr) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-10 text-right ${
                  pair.corr > 0.6 ? 'text-emerald-400' : pair.corr < -0.6 ? 'text-red-400' : 'text-slate-300'
                }`}>
                  {pair.corr > 0 ? '+' : ''}{pair.corr.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex-1">{pair.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insight Box */}
      <div className="glass rounded-xl p-4 border border-[#0ea5e9]/10">
        <div className="flex items-center gap-2 mb-2">
          <span>💡</span>
          <h3 className="text-sm font-semibold text-white">AI Correlation Insight</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          EURUSD and GBPUSD show the strongest positive correlation at +0.88, suggesting unified USD directional moves.
          XAUUSD holds negative correlation with USDJPY (-0.58) and USDCHF (-0.63), confirming gold’s safe-haven role.
          BTC and Nasdaq correlation at +0.67 signals risk-on/risk-off dynamics drive both assets simultaneously.
        </p>
      </div>
    </div>
  )
}
