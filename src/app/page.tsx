'use client'
// TradeLens AI v1.0 - Alerts, Correlations, Sessions all live
import dynamic from 'next/dynamic'
import Link from 'next/link'
import MarketBar from '@/components/MarketBar'
import Sidebar from '@/components/Sidebar'
import AIBiasPanel from '@/comp
                  <Link href="/calendar-ai" className="block bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      📅 Calendar AI
                    </h2>
                    <span className="text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <p className="text-gray-400 mb-4">AI-powered economic calendar with impact forecasting</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-xs text-red-300 font-bold">HIGH</span>
                    <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-xs text-yellow-300 font-bold">MEDIUM</span>
                    <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs text-green-300 font-bold">LOW</span>
                  </div>
                </Link>onents/AIBiasPanel'
import NewsCards from '@/components/NewsCards'
import SessionPanel from '@/components/SessionPanel'
import CorrelationPanel from '@/components/CorrelationPanel'
import AIStatusBar from '@/components/AIStatusBar'

const Globe = dynamic(() => import('@/components/Globe'), { ssr: false })

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#020408] grid-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <MarketBar />
        <AIStatusBar />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="glass rounded-xl p-1 glow-blue" style={{height: '420px'}}>
                  <Globe />
                </div>
              </div>
              <div className="space-y-4">
                <AIBiasPanel />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <NewsCards />
              </div>
              <div className="space-y-4">
                <SessionPanel />
                <CorrelationPanel />
              </div>
            </div>
            <footer className="text-center py-4 border-t border-blue-glow/10">
              <p className="text-xs text-slate-600">
                Built by{' '}
                <span className="text-[#0ea5e9] font-semibold glow-text-blue">SHUBHAM HULSURE</span>
                {' '}— TradeLens AI — AI Market Intelligence Operating System
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  )
}
