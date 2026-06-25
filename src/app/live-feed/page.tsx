'use client'
import { useEffect, useState } from 'react'

const SENTIMENT_COLORS: Record<string, string> = {
  BULLISH: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
  BEARISH: 'text-red-400 border-red-500/30 bg-red-500/5',
  NEUTRAL: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
}

export default function LiveFeedPage() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [updated, setUpdated] = useState('')

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      setNews(data.news || [])
      // Show current IST time as last updated
      setUpdated(new Date().toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNews() }, [])

  const filtered = news.filter(item => {
    const dir = (item.direction || 'NEUTRAL').toUpperCase()
    if (filter !== 'ALL' && filter !== 'HIGH' && dir !== filter) return false
    if (filter === 'HIGH' && (item.impact || 'LOW') !== 'HIGH') return false
    if (search) {
      const q = search.toLowerCase()
      const h = (item.headline || '').toLowerCase()
      const a = (item.assets || []).join(' ').toLowerCase()
      if (!h.includes(q) && !a.includes(q)) return false
    }
    return true
  })

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Live Intelligence Feed</h1>
          <p className="text-xs text-slate-500 mt-0.5">Real-time market news with AI sentiment • Times in IST</p>
        </div>
        <div className="flex items-center gap-3">
          {updated && <span className="text-[10px] text-slate-600">Updated {updated} IST</span>}
          <button
            onClick={() => { setLoading(true); fetchNews() }}
            className="px-3 py-1.5 rounded text-xs font-medium bg-[#0ea5e9]/20 border border-[#0ea5e9]/30 text-[#0ea5e9] hover:bg-[#0ea5e9]/30 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search news or asset..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 rounded-lg glass border border-white/10 text-xs text-slate-300 placeholder-slate-600 bg-transparent focus:outline-none focus:border-[#0ea5e9]/40"
        />
        {['ALL', 'BULLISH', 'BEARISH', 'NEUTRAL', 'HIGH'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? f === 'BULLISH' ? 'bg-emerald-500 text-black'
                : f === 'BEARISH' ? 'bg-red-500 text-white'
                : f === 'HIGH' ? 'bg-orange-500 text-white'
                : 'bg-[#0ea5e9] text-black'
                : 'glass border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      {!loading && (
        <p className="text-xs text-slate-600">{filtered.length} article{filtered.length !== 1 ? 's' : ''}</p>
      )}
      {/* Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-xl p-4 border border-white/5 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-slate-800 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-800 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-600 text-sm">No articles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item, i) => {
            const dir = (item.direction || 'NEUTRAL').toUpperCase()
            const sentColor = SENTIMENT_COLORS[dir] || SENTIMENT_COLORS.NEUTRAL
            const isHigh = item.impact === 'HIGH'
            const assets: string[] = item.assets || []
            const hasLink = item.link && item.link.startsWith('http')
            return (
              <div key={item.id ?? i} className={`glass rounded-xl p-4 border transition-all hover:border-[#0ea5e9]/30 ${
                isHigh ? 'border-orange-500/20' : 'border-white/5'
              }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    {hasLink ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-slate-100 leading-snug hover:text-[#0ea5e9] transition-colors cursor-pointer"
                      >
                        {item.headline || 'No headline'}
                        <span className="ml-1 text-[#0ea5e9] text-[10px] opacity-60">↗</span>
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-slate-100 leading-snug">
                        {item.headline || 'No headline'}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${sentColor}`}>
                    {dir}
                  </span>
                </div>
                {isHigh && (
                  <div className="mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-medium">
                      HIGH IMPACT
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {assets.slice(0, 3).map(a => (
                      <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/20">
                        {a}
                      </span>
                    ))}
                  </div>
                  <div className="text-right ml-2 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{item.source}</span>
                    <span className="text-[10px] text-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded">{item.time} IST</span>
                    {hasLink && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-[#0ea5e9] hover:text-[#0ea5e9]/80 border border-[#0ea5e9]/30 px-1.5 py-0.5 rounded transition-colors">
                        Read ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
