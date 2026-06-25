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
    ? Array(7).fill(null).map((_, i) => ({ symbol: '...', display: '...', price: 0, change: 0, decimals: 2 }))
    : ticks

  return (
    <div className="bg-[#040d1a] border-b border-blue-glow/20 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-6 text-xs font-mono">
            <span className="text-[#0ea5e9] font-bold">{t.display}</span>
            <span className="text-slate-200">
              {loading ? '---' : t.price.toFixed(t.decimals)}
            </span>
            <span className={t.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {loading ? '' : `${t.change >= 0 ? '+' : ''}${t.change.toFixed(2)}%`}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
