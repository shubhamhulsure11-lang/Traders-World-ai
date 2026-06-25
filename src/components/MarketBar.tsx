'use client'
import { useEffect, useState } from 'react'

const SYMBOL_MAP: Record<string, string> = {
  XAUUSD: 'XAU/USD',
  DXY: 'DXY',
  EURUSD: 'EUR/USD',
  BTC: 'BTC/USD',
  ETH: 'ETH/USD',
  SPX: 'S&P 500',
  US10Y: 'US10Y',
}

const DECIMALS: Record<string, number> = {
  XAUUSD: 2, DXY: 2, EURUSD: 4, BTC: 0, ETH: 2, SPX: 0, US10Y: 3,
}

interface Tick { symbol: string; display: string; price: number; change: number; decimals: number }

export default function MarketBar() {
  const [ticks, setTicks] = useState<Tick[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/prices')
      if (!res.ok) return
      const data = await res.json()
      const mapped: Tick[] = (data.assets || []).map((a: any) => ({
        symbol: a.asset,
        display: SYMBOL_MAP[a.asset] || a.asset,
        price: a.price,
        change: a.changePct,
        decimals: DECIMALS[a.asset] ?? 2,
      }))
      setTicks(mapped)
      setLoading(false)
    } catch {}
  }

  useEffect(() => {
    fetchPrices()
    const id = setInterval(fetchPrices, 30000)
    return () => clearInterval(id)
  }, [])

  const items = loading
    ? Array(7).fill(null).map((_, i) => ({ symbol: `SYM${i}`, display: '---', price: 0, change: 0, decimals: 2 }))
    : ticks

  if (items.length === 0) return null

  return (
    <div className="bg-[#040d1a]/95 border-b border-[#0ea5e9]/20 overflow-hidden relative" style={{height: '36px'}}>
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10" style={{background: 'linear-gradient(to right, #040d1a, transparent)'}} />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10" style={{background: 'linear-gradient(to left, #040d1a, transparent)'}} />
      <div className="flex animate-ticker whitespace-nowrap items-center h-full">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-8 text-xs font-mono shrink-0">
            <span className="text-[#0ea5e9] font-bold tracking-wide">{t.display}</span>
            <span className="text-slate-200 font-mono">
              {loading ? '---' : t.price.toFixed(t.decimals)}
            </span>
            {!loading && (
              <span className={`font-semibold ${
                t.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {t.change >= 0 ? '▲' : '▼'} {Math.abs(t.change).toFixed(2)}%
              </span>
            )}
            <span className="text-slate-700 text-[10px]">|</span>
          </span>
        ))}
      </div>
    </div>
  )
}
