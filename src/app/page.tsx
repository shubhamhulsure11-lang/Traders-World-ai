'use client'
import dynamic from 'next/dynamic'
import MarketBar from '@/components/MarketBar'
import Sidebar from '@/components/Sidebar'
import AIBiasPanel from '@/components/AIBiasPanel'
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
