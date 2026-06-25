'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface NewsItem {
  id: string
  title: string
  source: string
  pubDate: string
  link: string
  sentiment: string
  sentimentScore: number
  assets: string[]
  impact: string
}

const SENTIMENT_COLORS: Record<string, string> = {
  BULLISH: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30',
  BEARISH: 'text-red-400 bg-red-400/10 border-red-500/30',
  NEUTRAL: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30',
}

const IMPACT_COLORS: Record<string, string> = {
  HIGH: 'text-red-400',
  MEDIUM: 'text-yellow-400',
  LOW: 'text-slate-400',
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

export default function NewsCards() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news')
      if (!res.ok) return
      const data = await res.json()
      setNews(data.news || [])
      setLoading(false)
    } catch {}
  }

  useEffect(() => {
    fetchNews()
    const id = setInterval(fetchNews, 120000)
    return () => clearInterval(id)
  }, [])

  const filters = ['ALL', 'BULLISH', 'BEARISH', 'HIGH']
  const filtered = news.filter(n => {
    if (filter === 'ALL') return true
    if (filter === 'HIGH') return n.impact === 'HIGH'
    return n.sentiment === filter
  })

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-[#0ea5e9] uppercase tracking-widest">AI Intelligence Feed</h2>
        <Link href="/live-feed" className="text-[10px] text-[#0ea5e9] hover:text-sky-300">
          View all &rarr;
        </Link>
      </div>
      <div className="flex gap-1.5 mb-3">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
              filter === f
                ? 'bg-[#0ea5e9]/20 border-[#0ea5e9] text-[#0ea5e9]'
                : 'border-slate-700 text-slate-500 hover:border-slate-500'
            }`}>
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {loading
          ? Array(4).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-800/50 rounded-lg h-16" />
          ))
          : filtered.slice(0, 8).map((item) => (
            <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer"
              className="block rounded-lg p-3 bg-slate-900/60 border border-slate-800 hover:border-[#0ea5e9]/30 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs text-slate-200 leading-snug line-clamp-2 flex-1">{item.title}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border whitespace-nowrap ${SENTIMENT_COLORS[item.sentiment] || SENTIMENT_COLORS.NEUTRAL}`}>
                  {item.sentiment}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">{item.source}</span>
                <span className="text-slate-700">&middot;</span>
                <span className="text-[10px] text-slate-500">{timeAgo(item.pubDate)}</span>
                {item.impact === 'HIGH' && (
                  <span className="text-[9px] text-red-400 font-bold ml-auto">HIGH IMPACT</span>
                )}
                <div className="flex gap-1 ml-auto">
                  {item.assets.slice(0, 2).map(a => (
                    <span key={a} className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-400">{a}</span>
                  ))}
                </div>
              </div>
            </a>
          ))
        }
        {!loading && filtered.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-4">No news matching filter</p>
        )}
      </div>
    </div>
  )
}
