'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import MarketBar from '@/components/MarketBar'
import TradingViewChart from '@/components/TradingViewChart'

const BIAS_COLORS: Record<string, string> = {
  BULLISH: 'text-emerald-400', BEARISH: 'text-red-400', NEUTRAL: 'text-yellow-400'
}
const BIAS_BG: Record<string, string> = {
  BULLISH: 'border-emerald-500/40 bg-emerald-500/5',
  BEARISH: 'border-red-500/40 bg-red-500/5',
  NEUTRAL: 'border-yellow-500/40 bg-yellow-500/5'
}

export default function AssetAnalysisPage() {
  const params = useParams()
  const asset = (params.asset as string)?.toUpperCase()
  const [data, setData] = useState<any>(null)
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!asset) return
    Promise.all([
      fetch('/api/bias').then(r => r.json()),
      fetch('/api/news').then(r => r.json()),
    ]).then(([biasData, newsData]) => {
      const found = (biasData.biases || []).find((b: any) => b.asset === asset)
      setData(found || null)
      const assetNews = (newsData.news || []).filter((n: any) =>
        (n.assets || []).includes(asset)
      )
      setNews(assetNews.slice(0, 10))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [asset])

  return (
    <div className="flex h-screen overflow-hidden bg-[#020408] grid-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MarketBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 flex items-center gap-3">
            <Link href="/analysis" className="text-xs text-slate-500 hover:text-[#0ea5e9]">&larr; All Assets</Link>
            <span className="text-slate-700">/</span>
            <span className="text-sm font-bold text-white">{asset}</span>
          </div>

                  {/* TradingView Chart */}
                  <div className="glass rounded-xl p-6 border border-[#0ea5e9]/10 mb-6">
                              <TradingViewChart symbol={asset.toUpperCase()} />
                            </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="animate-pulse bg-slate-800/50 rounded-xl h-32" />)}
            </div>
          ) : !data ? (
            <div className="text-center py-20">
              <p className="text-slate-400">No data found for {asset}</p>
              <Link href="/analysis" className="text-[#0ea5e9] text-sm mt-2 inline-block">Back to Analysis</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2 space-y-4">
                {/* Bias Card */}
                <div className={`glass rounded-xl p-6 border ${BIAS_BG[data.bias] || 'border-slate-800'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-white">{data.asset}</h1>
                      <p className="text-slate-400 text-sm">{data.name}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${BIAS_COLORS[data.bias]}`}>{data.bias}</div>
                      <div className="text-xs text-slate-400">{data.strength} CONVICTION</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-900/60 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Price</div>
                      <div className="text-sm font-bold text-white">{data.price}</div>
                    </div>
                    <div className="bg-slate-900/60 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Change</div>
                      <div className={`text-sm font-bold ${data.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {data.changePct >= 0 ? '+' : ''}{Number(data.changePct).toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-slate-900/60 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1">Confidence</div>
                      <div className="text-sm font-bold text-white">{Math.round(data.confidence)}%</div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">AI Confidence Score</span>
                      <span className="text-slate-200">{Math.round(data.confidence)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className={`h-2 rounded-full ${
                        data.bias === 'BULLISH' ? 'bg-emerald-500' : data.bias === 'BEARISH' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} style={{ width: `${data.confidence}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="text-slate-400">Key Level (Support)</div>
                    <div className="text-slate-200 text-right">{data.keyLevel}</div>
                    <div className="text-slate-400">Target</div>
                    <div className="text-emerald-400 text-right">{data.target}</div>
                    <div className="text-slate-400">Stop</div>
                    <div className="text-red-400 text-right">{data.stop}</div>
                    <div className="text-slate-400">Timeframe</div>
                    <div className="text-slate-200 text-right">{data.timeframe}</div>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="glass rounded-xl p-5">
                  <h3 className="text-sm font-bold text-[#0ea5e9] uppercase tracking-widest mb-3">AI Reasoning</h3>
                  <div className="space-y-2">
                    {(data.reasoning || []).map((r: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-[#0ea5e9] mt-0.5 flex-shrink-0">{i + 1}.</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* News sidebar */}
              <div className="space-y-3">
                <div className="glass rounded-xl p-4">
                  <h3 className="text-sm font-bold text-[#0ea5e9] uppercase tracking-widest mb-3">Related News</h3>
                  {news.length === 0 ? (
                    <p className="text-xs text-slate-500">No news found for {asset}</p>
                  ) : (
                    <div className="space-y-2">
                      {news.map((n, i) => (
                        <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
                          className="block p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 hover:border-[#0ea5e9]/30 transition-colors">
                          <p className="text-xs text-slate-200 leading-snug mb-1 line-clamp-2">{n.title}</p>
                          <div className="flex gap-2 items-center">
                            <span className={`text-[9px] px-1 py-0.5 rounded border ${
                              n.sentiment === 'BULLISH' ? 'text-emerald-400 border-emerald-500/30' :
                              n.sentiment === 'BEARISH' ? 'text-red-400 border-red-500/30' :
                              'text-yellow-400 border-yellow-500/30'
                            }`}>{n.sentiment}</span>
                            <span className="text-[10px] text-slate-500">{n.source}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
