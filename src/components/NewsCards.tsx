'use client'
import { useState } from 'react'

const NEWS = [
  {
    id: 1, flag: '🇺🇸', country: 'United States', title: 'Fed Governor Signals Rate Cut Pause',
    time: '14 min ago', assets: ['XAU/USD', 'DXY', 'SPX'],
    impact: 'Gold Bullish', direction: 'UP', confidence: 83, risk: 'HIGH',
    reason: 'USD strength may temporarily limit Gold upside but macro trend remains bullish.'
  },
  {
    id: 2, flag: '🇨🇳', country: 'China', title: 'PBOC Increases Gold Reserves for 18th Month',
    time: '28 min ago', assets: ['XAU/USD', 'CNY'],
    impact: 'Gold Strongly Bullish', direction: 'UP', confidence: 92, risk: 'MEDIUM',
    reason: 'Central bank accumulation provides long-term structural support for Gold prices.'
  },
  {
    id: 3, flag: '🇪🇺', country: 'Eurozone', title: 'ECB Minutes Show Hawkish Tone',
    time: '41 min ago', assets: ['EUR/USD', 'DXY'],
    impact: 'EUR Bullish', direction: 'UP', confidence: 74, risk: 'MEDIUM',
    reason: 'Higher for longer ECB stance supports EUR/USD above 1.08 key level.'
  },
  {
    id: 4, flag: '🇺🇸', country: 'United States', title: 'BTC ETF Records $380M Inflows',
    time: '1h ago', assets: ['BTC/USD', 'ETH/USD'],
    impact: 'Crypto Bullish', direction: 'UP', confidence: 69, risk: 'MEDIUM',
    reason: 'Institutional demand through ETF channel reinforces current BTC uptrend.'
  },
  {
    id: 5, flag: '🇷🇺', country: 'Russia/Ukraine', title: 'Geopolitical Escalation in Eastern Europe',
    time: '1.5h ago', assets: ['XAU/USD', 'WTI', 'EUR/USD'],
    impact: 'Safe Haven Demand', direction: 'UP', confidence: 78, risk: 'HIGH',
    reason: 'Risk-off flows expected. Gold and JPY to benefit as safe haven assets.'
  },
]

const RISK_COLORS: Record<string, string> = {
  HIGH: 'text-red-400 bg-red-400/10',
  MEDIUM: 'text-yellow-400 bg-yellow-400/10',
  LOW: 'text-emerald-400 bg-emerald-400/10',
}

export default function NewsCards() {
  const [filter, setFilter] = useState('ALL')
  const filters = ['ALL', 'HIGH', 'MEDIUM', 'LOW']

  const filtered = filter === 'ALL' ? NEWS : NEWS.filter(n => n.risk === filter)

  return (
    <div className="glass rounded-xl p-4 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xs font-semibold text-[#0ea5e9] uppercase tracking-widest">AI Intelligence Feed</h2>
          <p className="text-[10px] text-slate-600 mt-0.5">Scored & ranked by AI impact engine</p>
        </div>
        <div className="flex gap-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[9px] px-2 py-0.5 rounded font-mono transition-colors ${
                filter === f
                  ? 'bg-[#0ea5e9]/20 text-[#0ea5e9] border border-[#0ea5e9]/30'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {filtered.map(news => (
          <div key={news.id} className="glass-bright rounded-lg p-3 fade-slide-up">
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0">{news.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-semibold text-white leading-tight">{news.title}</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${RISK_COLORS[news.risk]}`}>{news.risk}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-slate-600">{news.country}</span>
                  <span className="text-[9px] text-slate-700">•</span>
                  <span className="text-[9px] text-slate-600">{news.time}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-emerald-400 font-semibold">{news.impact}</span>
                  <span className="text-emerald-400 text-[10px]">↑ {news.confidence}%</span>
                </div>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {news.assets.map(a => (
                    <span key={a} className="text-[9px] bg-[#0ea5e9]/10 text-[#0ea5e9]/70 px-1.5 py-0.5 rounded font-mono">{a}</span>
                  ))}
                </div>
                <p className="text-[9px] text-slate-700 mt-1.5 leading-relaxed">{news.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
