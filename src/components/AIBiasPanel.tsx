'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface BiasItem {
  asset: string
  name: string
  bias: string
  strength: string
  confidence: number
  score: number
  reasoning: string[]
  price: number
  changePct: number
}

const BIAS_COLORS: Record<string, string> = {
  BULLISH: 'text-emerald-400',
  BEARISH: 'text-red-400',
  NEUTRAL: 'text-yellow-400',
}

const BIAS_BAR: Record<string, string> = {
  BULLISH: 'bg-emerald-500',
  BEARISH: 'bg-red-500',
  NEUTRAL: 'bg-yellow-500',
}

const STRENGTH_DOT: Record<string, string> = {
  HIGH: 'bg-emerald-400',
  MEDIUM: 'bg-yellow-400',
  LOW: 'bg-slate-400',
}

export default function AIBiasPanel() {
  const [biases, setBiases] = useState<BiasItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updated, setUpdated] = useState('')

  const fetchBias = async () => {
    try {
      const res = await fetch('/api/bias')
      if (!res.ok) return
      const data = await res.json()
      setBiases(data.biases || [])
      setUpdated(new Date().toLocaleTimeString())
      setLoading(false)
    } catch {}
  }

  useEffect(() => {
    fetchBias()
    const id = setInterval(fetchBias, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="glass rounded-xl p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-[#0ea5e9] uppercase tracking-widest">AI Market Bias</h2>
        <span className="text-[10px] text-slate-500">
          {loading ? 'Loading...' : `Updated ${updated}`}
        </span>
      </div>
      <div className="space-y-3">
        {loading
          ? Array(4).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800/50 rounded-lg h-14" />
          ))
          : biases.map((b) => (
            <Link key={b.asset} href={`/analysis/${b.asset}`}
              className="block rounded-lg p-2.5 bg-slate-900/60 border border-slate-800 hover:border-[#0ea5e9]/40 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${STRENGTH_DOT[b.strength] || 'bg-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-200">{b.asset}</span>
                  <span className="text-[10px] text-slate-500">{b.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${BIAS_COLORS[b.bias] || 'text-slate-400'}`}>{b.bias}</span>
                  <span className="text-[10px] text-slate-400">{Math.round(b.confidence)}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${BIAS_BAR[b.bias] || 'bg-slate-500'}`}
                  style={{ width: `${b.confidence}%` }}
                />
              </div>
              {b.reasoning?.[0] && (
                <p className="text-[10px] text-slate-500 mt-1 truncate">{b.reasoning[0]}</p>
              )}
            </Link>
          ))
        }
      </div>
      <Link href="/analysis" className="mt-3 flex items-center justify-center text-[10px] text-[#0ea5e9] hover:text-sky-300 transition-colors">
        View full analysis &rarr;
      </Link>
    </div>
  )
}
