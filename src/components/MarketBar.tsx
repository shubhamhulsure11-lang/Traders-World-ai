'use client'
import { useEffect, useState } from 'react'

const TICKERS = [
  { symbol: 'XAU/USD', base: 2374.50, decimals: 2 },
  { symbol: 'EUR/USD', base: 1.0842, decimals: 4 },
  { symbol: 'BTC/USD', base: 67450, decimals: 0 },
  { symbol: 'ETH/USD', base: 3520, decimals: 2 },
  { symbol: 'DXY', base: 104.23, decimals: 2 },
  { symbol: 'US10Y', base: 4.42, decimals: 3 },
  { symbol: 'S&P 500', base: 5284, decimals: 0 },
  { symbol: 'NASDAQ', base: 18640, decimals: 0 },
  { symbol: 'WTI OIL', base: 78.34, decimals: 2 },
  { symbol: 'SILVER', base: 29.87, decimals: 2 },
]

interface Tick { symbol: string; price: number; change: number; decimals: number }

export default function MarketBar() {
  const [ticks, setTicks] = useState<Tick[]>(
    TICKERS.map(t => ({ symbol: t.symbol, price: t.base, change: 0, decimals: t.decimals }))
  )

  useEffect(() => {
    const id = setInterval(() => {
      setTicks(prev => prev.map((t, i) => {
        const base = TICKERS[i].base
        const move = (Math.random() - 0.495) * base * 0.0006
        const price = Math.max(0.001, t.price + move)
        const change = ((price - base) / base) * 100
        return { ...t, price, change }
      }))
    }, 1800)
    return () => clearInterval(id)
  }, [])

  const doubled = [...ticks, ...ticks]

  return (
    <div className="h-9 glass border-b border-[#0ea5e9]/15 overflow-hidden flex items-center z-50 relative">
      <div className="flex items-center px-3 border-r border-[#0ea5e9]/20 shrink-0 h-full">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot mr-2" />
        <span className="text-[10px] font-mono text-[#0ea5e9]/60 uppercase tracking-widest">LIVE</span>
      </div>
      <div className="ticker-wrap flex-1 h-full flex items-center">
        <div className="ticker-move">
          {doubled.map((t, i) => (
            <div key={i} className="flex items-center gap-2 px-5 border-r border-[#0ea5e9]/10 whitespace-nowrap h-9">
              <span className="text-[11px] font-mono text-slate-500 tracking-wide">{t.symbol}</span>
              <span className="text-[11px] font-mono text-white font-semibold">
                {t.price.toFixed(t.decimals)}
              </span>
              <span className={`text-[11px] font-mono font-medium ${
                t.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {t.change >= 0 ? '+' : ''}{t.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
