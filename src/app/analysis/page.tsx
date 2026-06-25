'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import MarketBar from '@/components/MarketBar'

const ASSETS = ['XAUUSD', 'DXY', 'EURUSD', 'BTC', 'ETH', 'SPX', 'US10Y']
const ASSET_NAMES: Record<string, string> = {
  XAUUSD: 'Gold', DXY: 'US Dollar Index', EURUSD: 'EUR/USD',
  BTC: 'Bitcoin', ETH: 'Ethereum', SPX: 'S&P 500', US10Y: 'US 10Y Yield'
}

const BIAS_COLORS: Record<string, string> = {
  BULLISH: 'text-emerald-400', BEARISH: 'text-red-400', NEUTRAL: 'text-yellow-400'
}
const BIAS_BG: Record<string, string> = {
  BULLISH: 'bg-emerald-500/10 border-emerald-500/30',
  BEARISH: 'bg-red-500/10 border-red-500/30',
  NEUTRAL: 'bg-yellow-500/10 border-yellow-500/30'
}

export default function AnalysisPage() {
  const [biases, setBiases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bias')
      .then(r => r.json())
      .then(d => { setBiases(d.biases || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-[#020408] grid-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MarketBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white mb-1">AI Analysis</h1>
            <p className="text-sm text-slate-500">Real-time AI bias signals across all tracked assets</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading
              ? ASSETS.map(a => <div key={a} className="animate-pulse bg-slate-800/50 rounded-xl h-48" />)
              : biases.map(b => (
                <Link key={b.asset} href={`/analysis/${b.asset}`}
                  className={`glass rounded-xl p-5 border hover:scale-[1.01] transition-transform ${BIAS_BG[b.bias] || 'border-slate-800'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-lg font-bold text-white">{b.asset}</div>
                      <div className="text-xs text-slate-400">{b.name}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${BIAS_COLORS[b.bias]}`}>{b.bias}</div>
                      <div className="text-xs text-slate-400">{b.strength}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Confidence</span>
                      <span className="text-slate-200">{Math.round(b.confidence)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${
                        b.bias === 'BULLISH' ? 'bg-emerald-500' : b.bias === 'BEARISH' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} style={{ width: `${b.confidence}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    {(b.reasoning || []).slice(0, 2).map((r: string, i: number) => (
                      <p key={i} className="text-[11px] text-slate-400 leading-snug">
                        &bull; {r}
                      </p>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Price: <span className="text-slate-200">{b.price}</span>
                    </span>
                    <span className={`text-xs font-medium ${b.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {b.changePct >= 0 ? '+' : ''}{Number(b.changePct).toFixed(2)}%
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-[#0ea5e9]">View deep-dive &rarr;</div>
                </Link>
              ))
            }
          </div>
        </main>
      </div>
    </div>
  )
}
