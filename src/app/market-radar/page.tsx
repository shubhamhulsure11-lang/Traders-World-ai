'use client'
import { useEffect, useState } from 'react'

type NewsItem = {
  id?: string
  headline: string
  direction: string
  assets: string[]
  impact?: string
  source: string
  time: string
}

export default function MarketRadarPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sentiment, setSentiment] = useState({ bullish: 0, bearish: 0, neutral: 0 })
  const [trending, setTrending] = useState<{ asset: string; count: number }[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      const items: NewsItem[] = data.news || []
      setNews(items)

      // Calculate sentiment distribution
      const bulls = items.filter(n => (n.direction || 'NEUTRAL').toUpperCase() === 'BULLISH').length
      const bears = items.filter(n => (n.direction || 'NEUTRAL').toUpperCase() === 'BEARISH').length
      const neuts = items.filter(n => (n.direction || 'NEUTRAL').toUpperCase() === 'NEUTRAL').length
      setSentiment({ bullish: bulls, bearish: bears, neutral: neuts })

      // Calculate trending assets
      const assetCount: Record<string, number> = {}
      items.forEach(item => {
        (item.assets || []).forEach(asset => {
          assetCount[asset] = (assetCount[asset] || 0) + 1
        })
      })
      const sorted = Object.entries(assetCount)
        .map(([asset, count]) => ({ asset, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
      setTrending(sorted)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const total = sentiment.bullish + sentiment.bearish + sentiment.neutral
  const bullPct = total > 0 ? Math.round((sentiment.bullish / total) * 100) : 0
  const bearPct = total > 0 ? Math.round((sentiment.bearish / total) * 100) : 0
  const neutPct = total > 0 ? Math.round((sentiment.neutral / total) * 100) : 0

  const marketMood = bullPct > 50 ? 'RISK-ON' : bearPct > 50 ? 'RISK-OFF' : 'NEUTRAL'
  const moodColor = marketMood === 'RISK-ON' ? 'text-emerald-400' : marketMood === 'RISK-OFF' ? 'text-red-400' : 'text-yellow-400'

  const highImpactNews = news.filter(n => n.impact === 'HIGH').slice(0, 5)

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide">Market Radar</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time sentiment analysis & trending assets</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-6 border border-white/5 animate-pulse">
              <div className="h-6 bg-slate-800 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-slate-800 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Top Row - Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Market Mood Gauge */}
            <div className="glass rounded-xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400">Market Mood</h3>
                <span className="text-xs text-slate-600">Last {total} articles</span>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${moodColor} mb-2`}>{marketMood}</div>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <span className="text-emerald-400">↑ {bullPct}%</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-yellow-400">→ {neutPct}%</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-red-400">↓ {bearPct}%</span>
                </div>
              </div>
            </div>

            {/* Sentiment Distribution */}
            <div className="glass rounded-xl p-6 border border-white/5">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Sentiment Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-emerald-400">Bullish</span>
                    <span className="text-slate-500">{sentiment.bullish}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${bullPct}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-red-400">Bearish</span>
                    <span className="text-slate-500">{sentiment.bearish}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${bearPct}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-yellow-400">Neutral</span>
                    <span className="text-slate-500">{sentiment.neutral}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: `${neutPct}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* High Impact Count */}
            <div className="glass rounded-xl p-6 border border-orange-500/20">
              <h3 className="text-sm font-medium text-slate-400 mb-4">High Impact Alerts</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-400 mb-2">
                  {news.filter(n => n.impact === 'HIGH').length}
                </div>
                <p className="text-xs text-slate-500">Critical events monitored</p>
              </div>
            </div>
          </div>

          {/* Second Row - Trending Assets & High Impact News */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Trending Assets */}
            <div className="glass rounded-xl p-6 border border-white/5">
              <h3 className="text-sm font-medium text-slate-400 mb-4">Trending Assets</h3>
              <div className="grid grid-cols-2 gap-3">
                {trending.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-[#0ea5e9]">{item.asset}</span>
                    <span className="text-xs text-slate-500">{item.count} mentions</span>
                  </div>
                ))}
              </div>
            </div>

            {/* High Impact News */}
            <div className="glass rounded-xl p-6 border border-white/5">
              <h3 className="text-sm font-medium text-slate-400 mb-4">High Impact Events</h3>
              <div className="space-y-2">
                {highImpactNews.length === 0 ? (
                  <p className="text-xs text-slate-600 text-center py-4">No high impact events</p>
                ) : (
                  highImpactNews.map((item, i) => {
                    const dir = (item.direction || 'NEUTRAL').toUpperCase()
                    const color = dir === 'BULLISH' ? 'text-emerald-400' : dir === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'
                    return (
                      <div key={i} className="flex items-start gap-2 p-2 rounded bg-slate-800/20 border border-white/5">
                        <span className={`text-xs font-bold ${color} shrink-0 mt-0.5`}>•</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 leading-snug truncate">{item.headline}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-slate-600">{item.time} IST</span>
                            {(item.assets || []).slice(0, 2).map(a => (
                              <span key={a} className="text-[9px] px-1 py-0.5 rounded bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20">
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
