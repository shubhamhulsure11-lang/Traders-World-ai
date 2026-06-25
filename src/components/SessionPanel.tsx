'use client'
import { useEffect, useState } from 'react'

const SESSIONS = [
  { name: 'Asian', open: 0, close: 9, color: '#f59e0b', emoji: '🏯', assets: ['JPY', 'AUD', 'Gold'] },
  { name: 'London', open: 8, close: 17, color: '#0ea5e9', emoji: '🇬🇧', assets: ['EUR', 'GBP', 'Gold'] },
  { name: 'New York', open: 13, close: 22, color: '#10b981', emoji: '🇺🇸', assets: ['USD', 'SPX', 'BTC'] },
]

export default function SessionPanel() {
  const [utcHour, setUtcHour] = useState(0)

  useEffect(() => {
    const update = () => setUtcHour(new Date().getUTCHours())
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])

  const isActive = (open: number, close: number) => {
    if (close > open) return utcHour >= open && utcHour < close
    return utcHour >= open || utcHour < close
  }

  const overlap = isActive(8, 9) && isActive(13, 17)

  return (
    <div className="glass rounded-xl p-4 card-hover">
      <div className="mb-3">
        <h2 className="text-xs font-semibold text-[#0ea5e9] uppercase tracking-widest">Session Intelligence</h2>
        <p className="text-[10px] text-slate-600 mt-0.5">UTC {new Date().toISOString().slice(11,16)}</p>
      </div>
      {overlap && (
        <div className="mb-3 glass-bright rounded-lg px-3 py-2 text-[10px] text-yellow-400 font-semibold">
          ⚡ London-NY Overlap — High Liquidity
        </div>
      )}
      <div className="space-y-2">
        {SESSIONS.map(s => {
          const active = isActive(s.open, s.close)
          return (
            <div key={s.name} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
              active ? 'bg-opacity-10 border border-opacity-20' : 'opacity-50'
            }`}
            style={active ? { background: `${s.color}10`, borderColor: `${s.color}30` } : {}}
            >
              <span className="text-base">{s.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{s.name}</span>
                  {active && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: s.color, background: `${s.color}20` }}>ACTIVE</span>
                  )}
                </div>
                <div className="flex gap-1 mt-1">
                  {s.assets.map(a => (
                    <span key={a} className="text-[9px] text-slate-600">{a}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-600 font-mono">{s.open.toString().padStart(2,'0')}:00</p>
                <p className="text-[9px] text-slate-700">–{s.close.toString().padStart(2,'0')}:00</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
