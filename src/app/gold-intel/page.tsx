'use client'
import { useState, useEffect } from 'react'

interface GoldData {
  price: number
  change: number
  changePercent: number
  high24h: number
  low24h: number
  volume: string
}

interface NewsItem {
  id: string
  title: string
  time: string
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
}

export default function GoldIntelPage() {
  const [goldData, setGoldData] = useState<GoldData>({
    price: 4008.9,
    change: -172.45,
    changePercent: -4.14,
    high24h: 4198.35,
    low24h: 3988.12,
    volume: '$142.5B'
  })

  const [timeframe, setTimeframe] = useState('4H')

  const keyLevels = [
    { label: 'Major Resistance', value: 4250, type: 'resistance' },
    { label: 'Minor Resistance', value: 4180, type: 'resistance' },
    { label: 'Current Price', value: goldData.price, type: 'current' },
    { label: 'Support Zone', value: 3988, type: 'support' },
    { label: 'Strong Support', value: 3920, type: 'support' }
  ]

  const correlations = [
    { asset: 'DXY', correlation: -0.72, description: 'Inverse correlation - strong USD weakness boosts gold' },
    { asset: 'US10Y', correlation: -0.58, description: 'Negative correlation with real yields' },
    { asset: 'EURUSD', correlation: 0.68, description: 'Positive correlation - both benefit from USD weakness' },
    { asset: 'Silver', correlation: 0.85, description: 'Strong positive correlation with precious metals' }
  ]

  const recentNews: NewsItem[] = [
    { id: '1', title: 'Fed signals potential rate pause amid inflation concerns', time: '2h ago', sentiment: 'BULLISH' },
    { id: '2', title: 'Central banks increase gold reserves by 15% QoQ', time: '4h ago', sentiment: 'BULLISH' },
    { id: '3', title: 'Dollar strength pressures gold prices near key support', time: '6h ago', sentiment: 'BEARISH' },
    { id: '4', title: 'Geopolitical tensions drive safe-haven demand', time: '8h ago', sentiment: 'BULLISH' }
  ]

  const bias = goldData.changePercent < -3 ? 'BEARISH' : goldData.changePercent > 3 ? 'BULLISH' : 'NEUTRAL'
  const biasColor = bias === 'BULLISH' ? 'text-emerald-400' : bias === 'BEARISH' ? 'text-red-400' : 'text-slate-400'

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gold Intelligence</h1>
          <p className="text-sm text-slate-400">Real-time XAUUSD analysis and market insights</p>
        </div>
        <div className="flex gap-2">
          {['1H', '4H', '1D', '1W'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeframe === tf
                  ? 'bg-cyan-500 text-white'
                  : 'glass hover:bg-[#0ea5e9]/10'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Price Card */}
      <div className="glass rounded-xl p-6 border border-[#0ea5e9]/10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold">${goldData.price.toLocaleString()}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                goldData.changePercent < 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {goldData.changePercent > 0 ? '+' : ''}{goldData.changePercent}%
              </span>
            </div>
            <p className="text-slate-400">XAUUSD • Gold Spot Price</p>
          </div>
          <div className={`text-right ${biasColor}`}>
            <div className="text-2xl font-bold">{bias}</div>
            <p className="text-sm opacity-70">AI Market Bias</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">24H Change</p>
            <p className={`font-bold ${
              goldData.change < 0 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {goldData.change > 0 ? '+' : ''}${goldData.change}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">24H High</p>
            <p className="font-bold">${goldData.high24h.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">24H Low</p>
            <p className="font-bold">${goldData.low24h.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">24H Volume</p>
            <p className="font-bold">{goldData.volume}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Key Levels */}
        <div className="glass rounded-xl p-6 border border-[#0ea5e9]/10">
          <h3 className="text-lg font-bold mb-4">Key Price Levels</h3>
          <div className="space-y-3">
            {keyLevels.map((level, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className={`text-sm ${
                  level.type === 'current' ? 'font-bold text-cyan-400' :
                  level.type === 'resistance' ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {level.label}
                </span>
                <span className="font-mono font-bold">${level.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Correlations */}
        <div className="glass rounded-xl p-6 border border-[#0ea5e9]/10">
          <h3 className="text-lg font-bold mb-4">Asset Correlations</h3>
          <div className="space-y-3">
            {correlations.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{item.asset}</span>
                  <span className={`font-bold ${
                    item.correlation > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {item.correlation > 0 ? '+' : ''}{item.correlation}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent News */}
      <div className="glass rounded-xl p-6 border border-[#0ea5e9]/10">
        <h3 className="text-lg font-bold mb-4">Gold Market News</h3>
        <div className="space-y-3">
          {recentNews.map(news => (
            <div key={news.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                news.sentiment === 'BULLISH' ? 'bg-emerald-400' :
                news.sentiment === 'BEARISH' ? 'bg-red-400' : 'bg-slate-400'
              }`} />
              <div className="flex-1">
                <p className="font-medium mb-1">{news.title}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{news.time}</span>
                  <span className={`${
                    news.sentiment === 'BULLISH' ? 'text-emerald-400' :
                    news.sentiment === 'BEARISH' ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {news.sentiment}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
