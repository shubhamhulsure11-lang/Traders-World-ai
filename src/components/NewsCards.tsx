'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const SENTIMENT_COLORS: Record<string, string> = {
  BULLISH: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/30',
  BEARISH: 'text-red-400 bg-red-400/10 border-red-500/30',
  NEUTRAL: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30',
}

export default function NewsCards() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(d => setNews((d.news || []).slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="glass rounded-2xl border border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">Market Intelligence</h2>
        <span className="text-[10px] text-slate-500">AI Scored • IST</span>
      </div>
      <div className="space-y-2">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="p-3 rounded-lg bg-white/2 border border-white/5 animate-pulse">
              <div className="h-3 bg-slate-800 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-slate-800 rounded w-1/2"></div>
            </div>
          ))
        ) : news.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-4">No news available</p>
        ) : (
          news.map((item, i) => {
            const dir = (item.direction || 'NEUTRAL').toUpperCase()
            const sentColor = SENTIMENT_COLORS[dir] || SENTIMENT_COLORS.NEUTRAL
            const assets: string[] = item.assets || []
            const hasLink = item.link && item.link.startsWith('http')
            return (
              <div key={item.id ?? i} className="p-3 rounded-lg bg-white/2 hover:bg-white/4 transition-colors border border-white/5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  {hasLink ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-slate-200 leading-snug flex-1 line-clamp-2 hover:text-[#0ea5e9] transition-colors">
                      {item.headline || 'No headline'}
                    </a>
                  ) : (
                    <p className="text-xs text-slate-200 leading-snug flex-1 line-clamp-2">
                      {item.headline || 'No headline'}
                    </p>
                  )}
                  <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded border font-semibold ${sentColor}`}>
                    {dir}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {assets.slice(0, 2).map(a => (
                      <span key={a} className="text-[9px] px-1 py-0.5 rounded bg-[#0ea5e9]/10 text-[#0ea5e9]">{a}</span>
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-600">{item.source} · {item.time} IST</span>
                </div>
              </div>
            )
          })
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-white/5">
        <Link href="/live-feed" className="text-[10px] text-[#0ea5e9] hover:text-[#0ea5e9]/80 transition-colors">
          View all news →
        </Link>
      </div>
    </div>
  )
}
