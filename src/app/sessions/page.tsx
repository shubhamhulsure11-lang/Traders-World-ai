'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import MarketBar from '@/components/MarketBar'

const SESSIONS = [
  {
    name: 'Asian Session',
    hours: '00:00 - 09:00 UTC',
    cities: ['Tokyo', 'Singapore', 'Sydney', 'Hong Kong'],
    keyAssets: ['XAUUSD', 'DXY', 'JPY pairs'],
    characteristics: ['Low volatility typical', 'Range-bound price action', 'Gold accumulation phase', 'JPY and AUD driven'],
    bias: 'Consolidation',
    color: 'border-purple-500/30 bg-purple-500/5',
    dot: 'bg-purple-400',
  },
  {
    name: 'London Session',
    hours: '08:00 - 17:00 UTC',
    cities: ['London', 'Frankfurt', 'Paris', 'Zurich'],
    keyAssets: ['EURUSD', 'XAUUSD', 'DXY', 'GBP pairs'],
    characteristics: ['Highest liquidity window', 'Major breakouts occur here', 'ECB and BOE influence', 'Gold trending moves'],
    bias: 'High Volatility',
    color: 'border-[#0ea5e9]/30 bg-[#0ea5e9]/5',
    dot: 'bg-[#0ea5e9]',
  },
  {
    name: 'New York Session',
    hours: '13:00 - 22:00 UTC',
    cities: ['New York', 'Chicago', 'Toronto'],
    keyAssets: ['SPX', 'BTC', 'DXY', 'US10Y'],
    characteristics: ['US data releases dominate', 'USD strength/weakness key', 'Equities and crypto move', 'Fed policy driven'],
    bias: 'Trend Continuation',
    color: 'border-emerald-500/30 bg-emerald-500/5',
    dot: 'bg-emerald-400',
  },
]

export default function SessionsPage() {
  const [time, setTime] = useState(new Date())
  const [prices, setPrices] = useState<any[]>([])

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetch('/api/prices').then(r => r.json()).then(d => setPrices(d.assets || [])).catch(() => {})
  }, [])

  const utcHour = time.getUTCHours()
  const utcMin = time.getUTCMinutes()
  const utcDecimal = utcHour + utcMin / 60

  function getActiveSession(): string {
    if (utcDecimal >= 0 && utcDecimal < 9) return 'Asian Session'
    if (utcDecimal >= 8 && utcDecimal < 17) return 'London Session'
    if (utcDecimal >= 13 && utcDecimal < 22) return 'New York Session'
    return 'Off Hours'
  }

  const activeSession = getActiveSession()
  const isOverlap = utcDecimal >= 13 && utcDecimal < 17

  return (
    <div className="flex h-screen overflow-hidden bg-[#020408] grid-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MarketBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white mb-1">Session Intelligence</h1>
            <p className="text-sm text-slate-500">Live trading session tracker — Asian, London, New York</p>
          </div>

          {/* Live Clock */}
          <div className="glass rounded-xl p-5 mb-6 flex items-center justify-between">
            <div>
              <div className="text-3xl font-mono font-bold text-white">
                {time.toUTCString().split(' ')[4]} UTC
              </div>
              <div className="text-sm text-slate-400 mt-1">
                {time.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long' })} IST
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${
                activeSession === 'Asian Session' ? 'text-purple-400' :
                activeSession === 'London Session' ? 'text-[#0ea5e9]' :
                activeSession === 'New York Session' ? 'text-emerald-400' : 'text-slate-400'
              }`}>{activeSession}</div>
              {isOverlap && (
                <div className="text-xs text-yellow-400 mt-1">London / NY Overlap — Peak Volatility</div>
              )}
            </div>
          </div>

          {/* Session Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {SESSIONS.map(session => {
              const isActive = activeSession === session.name
              return (
                <div key={session.name} className={`glass rounded-xl p-5 border transition-all ${
                  isActive ? session.color + ' ring-1 ring-current' : 'border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${isActive ? session.dot + ' animate-pulse' : 'bg-slate-600'}`} />
                    <h3 className="text-sm font-bold text-white">{session.name}</h3>
                    {isActive && <span className="text-[10px] text-emerald-400 ml-auto">ACTIVE</span>}
                  </div>
                  <div className="text-xs text-slate-400 mb-3">{session.hours}</div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {session.cities.map(c => (
                      <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{c}</span>
                    ))}
                  </div>
                  <div className="mb-3">
                    <div className="text-[10px] text-slate-500 mb-1.5">KEY ASSETS</div>
                    <div className="flex flex-wrap gap-1">
                      {session.keyAssets.map(a => (
                        <span key={a} className="text-[10px] px-1.5 py-0.5 rounded border border-[#0ea5e9]/30 text-[#0ea5e9]">{a}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {session.characteristics.map((c, i) => (
                      <p key={i} className="text-[10px] text-slate-400">&bull; {c}</p>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Live Prices Grid */}
          {prices.length > 0 && (
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-bold text-[#0ea5e9] uppercase tracking-widest mb-4">Live Market Snapshot</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {prices.map((p: any) => (
                  <div key={p.asset} className="bg-slate-900/60 rounded-lg p-3 text-center">
                    <div className="text-xs font-bold text-slate-300 mb-1">{p.asset}</div>
                    <div className="text-sm font-mono text-white">{p.price}</div>
                    <div className={`text-[10px] font-medium ${
                      p.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>{p.changePct >= 0 ? '+' : ''}{Number(p.changePct).toFixed(2)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
