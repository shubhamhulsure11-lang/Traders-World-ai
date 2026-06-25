'use client'
import { useState, useEffect } from 'react'

interface Alert {
  id: string
  asset: string
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  message: string
  confidence: number
  timestamp: string
  source: string
  triggered: boolean
}

const MOCK_ALERTS: Alert[] = [
  { id: '1', asset: 'XAUUSD', type: 'BULLISH', impact: 'HIGH', message: 'Gold breaks above key resistance at 2350 — momentum building', confidence: 82, timestamp: new Date(Date.now() - 5 * 60000).toISOString(), source: 'AI Bias Engine', triggered: true },
  { id: '2', asset: 'EURUSD', type: 'BEARISH', impact: 'MEDIUM', message: 'EUR/USD fails at 1.0850 resistance — bearish reversal signal', confidence: 71, timestamp: new Date(Date.now() - 18 * 60000).toISOString(), source: 'AI Bias Engine', triggered: true },
  { id: '3', asset: 'BTC-USD', type: 'BULLISH', impact: 'HIGH', message: 'Bitcoin reclaims $65K — accumulation zone confirmed', confidence: 76, timestamp: new Date(Date.now() - 32 * 60000).toISOString(), source: 'Price Action', triggered: true },
  { id: '4', asset: 'GBPUSD', type: 'BEARISH', impact: 'LOW', message: 'GBP/USD inside day — range bound, await breakout', confidence: 58, timestamp: new Date(Date.now() - 55 * 60000).toISOString(), source: 'Session Tracker', triggered: false },
  { id: '5', asset: 'US100', type: 'BULLISH', impact: 'MEDIUM', message: 'Nasdaq holds 18,000 support — tech sector resilient', confidence: 67, timestamp: new Date(Date.now() - 90 * 60000).toISOString(), source: 'Market Radar', triggered: true },
  { id: '6', asset: 'XAUUSD', type: 'NEUTRAL', impact: 'LOW', message: 'Gold consolidating — wait for CPI data reaction', confidence: 55, timestamp: new Date(Date.now() - 120 * 60000).toISOString(), source: 'Calendar AI', triggered: false },
]

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  return `${Math.floor(diff / 60)}h ago`
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [filter, setFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH' | 'HIGH'>('ALL')
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  const filtered = filter === 'ALL' ? alerts
    : filter === 'HIGH' ? alerts.filter(a => a.impact === 'HIGH')
    : alerts.filter(a => a.type === filter)

  async function sendTestAlert() {
    setTelegramStatus('sending')
    try {
      const res = await fetch('/api/bias')
      const data = await res.json()
      setTelegramStatus('sent')
      setTimeout(() => setTelegramStatus('idle'), 3000)
    } catch {
      setTelegramStatus('error')
      setTimeout(() => setTelegramStatus('idle'), 3000)
    }
  }

  const impactColor = { HIGH: 'text-red-400 bg-red-400/10', MEDIUM: 'text-yellow-400 bg-yellow-400/10', LOW: 'text-slate-400 bg-slate-400/10' }
  const typeColor = { BULLISH: 'text-emerald-400', BEARISH: 'text-red-400', NEUTRAL: 'text-slate-400' }
  const typeDot = { BULLISH: 'bg-emerald-400', BEARISH: 'bg-red-400', NEUTRAL: 'bg-slate-500' }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Alert Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">Telegram-powered AI signal alerts — real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded glass border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-emerald-400">Telegram Active</span>
          </div>
          <button
            onClick={sendTestAlert}
            disabled={telegramStatus === 'sending'}
            className="px-4 py-2 rounded text-xs font-medium bg-[#0ea5e9]/20 border border-[#0ea5e9]/30 text-[#0ea5e9] hover:bg-[#0ea5e9]/30 transition-colors disabled:opacity-50"
          >
            {telegramStatus === 'sending' ? 'Sending...' : telegramStatus === 'sent' ? 'Sent!' : telegramStatus === 'error' ? 'Error' : 'Test Alert'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Alerts', value: alerts.length, color: 'text-[#0ea5e9]' },
          { label: 'High Impact', value: alerts.filter(a => a.impact === 'HIGH').length, color: 'text-red-400' },
          { label: 'Bullish', value: alerts.filter(a => a.type === 'BULLISH').length, color: 'text-emerald-400' },
          { label: 'Triggered', value: alerts.filter(a => a.triggered).length, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-4 border border-white/5">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'BULLISH', 'BEARISH', 'HIGH'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-[#0ea5e9] text-black'
                : 'glass border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {f === 'HIGH' ? 'HIGH IMPACT' : f}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filtered.map(alert => (
          <div key={alert.id} className={`glass rounded-xl p-4 border transition-all ${
            alert.triggered ? 'border-[#0ea5e9]/20 hover:border-[#0ea5e9]/40' : 'border-white/5 opacity-70'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${typeDot[alert.type]}`}></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{alert.asset}</span>
                    <span className={`text-xs font-semibold ${typeColor[alert.type]}`}>{alert.type}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${impactColor[alert.impact]}`}>{alert.impact}</span>
                    {alert.triggered && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0ea5e9]/10 text-[#0ea5e9]">SENT</span>}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-slate-600">{alert.source}</span>
                    <span className="text-[10px] text-slate-600">{timeAgo(alert.timestamp)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-white">{alert.confidence}%</div>
                <div className="text-[10px] text-slate-600">confidence</div>
                <div className="mt-2 h-1 w-16 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      alert.type === 'BULLISH' ? 'bg-emerald-400' : alert.type === 'BEARISH' ? 'bg-red-400' : 'bg-slate-500'
                    }`}
                    style={{ width: `${alert.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Telegram Info */}
      <div className="glass rounded-xl p-4 border border-[#0ea5e9]/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">📱</span>
          <h3 className="text-sm font-semibold text-white">Telegram Integration</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-500 mb-1">Bot Name</p>
            <p className="text-slate-300 font-medium">TradeLensAI_Shubham_bot</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Auto-Alert Threshold</p>
            <p className="text-slate-300 font-medium">±1.5% price move</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Cron Schedule</p>
            <p className="text-slate-300 font-medium">Every 15 minutes</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Status</p>
            <p className="text-emerald-400 font-medium">Active & Monitoring</p>
          </div>
        </div>
      </div>
    </div>
  )
}
