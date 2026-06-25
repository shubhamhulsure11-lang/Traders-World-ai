'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import MarketBar from '@/components/MarketBar'

const SENTIMENT_COLORS: Record<string, string> = {
  BULLISH: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
  BEARISH: 'text-red-400 border-red-500/30 bg-red-500/5',
  NEUTRAL: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function LiveFeedPage() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [lastUpdated, setLastUpdated] = useState('')

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      setNews(data.news || [])
      setLastUpdated(new Date().toLocaleTimeString())
      setLoading(false)
    } catch {}
  }

  useEffect(() => {
    fetchNews()
    const id = setInterval(fetchNews, 120000)
    return () => clearInterval(id)
  }, [])

  const sentiments = ['ALL', 'BULLISH', 'BEARISH', 'NEUTRAL', 'HIGH']
  const filtered = news.filter(n => {
    const matchFilter = filter === 'ALL' ? true : filter === 'HIGH' ? n.impact === 'HIGH' : n.sentiment === filter
    const matchSearch = search === '' ? true : n.title.toLowerCase().includes(search.toLowerCase()) || (n.assets || []).some((a: string) => a.toLowerCase().includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  return (
    <div className="flex h-screen overflow-hidden bg-[#020408] grid-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MarketBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white mb-1">Live Intelligence Feed</h1>
              <p className="text-sm text-slate-500">Real-time market news with AI sentiment scoring</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">Updated {lastUpdated}</span>
              <button onClick={fetchNews} className="text-xs text-[#0ea5e9] hover:text-sky-300 px-3 py-1.5 border border-[#0ea5e9]/30 rounded-lg">
                Refresh
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Search news or asset..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0ea5e9]/50"
            />
            <div className="flex gap-1.5">
              {sentiments.map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    filter === s
                      ? 'bg-[#0ea5e9]/20 border-[#0ea5e9] text-[#0ea5e9]'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}>{s}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500 mb-3">{filtered.length} articles</div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {loading
              ? Array(9).fill(0).map((_, i) => <div key={i} className="animate-pulse bg-slate-800/50 rounded-xl h-32" />)
              : filtered.map(item => (
                <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer"
                  className="glass rounded-xl p-4 border border-slate-800 hover:border-[#0ea5e9]/30 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm text-slate-100 leading-snug line-clamp-3 flex-1">{item.title}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border whitespace-nowrap ml-2 ${SENTIMENT_COLORS[item.sentiment] || SENTIMENT_COLORS.NEUTRAL}`}>
                        {item.sentiment}
                      </span>
                    </div>
                    {item.impact === 'HIGH' && (
                      <span className="inline-block text-[9px] text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded mb-2">HIGH IMPACT</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-1">
                      {(item.assets || []).slice(0, 3).map((a: string) => (
                        <span key={a} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{a}</span>
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500">{item.source}</div>
                      <div className="text-[10px] text-slate-600">{timeAgo(item.pubDate)}</div>
                    </div>
                  </div>
                </a>
              ))
            }
          </div>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500">No news matching your filter</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
