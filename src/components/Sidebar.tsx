'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { icon: '⚡', label: 'Dashboard', href: '/' },
  { icon: '🌐', label: 'Globe', href: '/' },
  { icon: '✅', label: 'AI Analysis', href: '/analysis' },
  { icon: '📰', label: 'Live Feed', href: '/live-feed' },
  { icon: '🎯', label: 'Market Radar', href: '/' },
  { icon: '📅', label: 'Calendar AI', href: '/calendar-ai' },
  { icon: '🔬', label: 'Gold Intel', href: '/analysis/XAUUSD' },
  { icon: '🔗', label: 'Correlations', href: '/correlations' },
  { icon: '⏰', label: 'Sessions', href: '/sessions' },
  { icon: '🔔', label: 'Alerts', href: '/alerts' },
  { icon: '📔', label: 'Journal', href: '/' },
  { icon: '⚙️', label: 'Settings', href: '/' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  function isActive(href: string, label: string) {
    if (href === '/' && label === 'Dashboard') return pathname === '/'
    if (href === '/') return false
    return pathname.startsWith(href)
  }

  return (
    <aside className={`h-screen ${collapsed ? 'w-16' : 'w-64'} bg-[#0a0e27] border-r border-blue-glow/10 transition-all flex flex-col`}>
      <div className="p-6 border-b border-blue-glow/10 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">TRADELENS</h1>
            <p className="text-xs text-gray-500">AI MARKET INTELLIGENCE</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {NAV.map(item => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive(item.href, item.label)
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-glow/10 text-center">
        {!collapsed && (
          <p className="text-xs text-gray-600">
            Built by<br />
            <span className="text-[#0ea5e9] font-semibold glow-text-blue">SHUBHAM HULSURE</span>
          </p>
        )}
      </div>
    </aside>
  )
}
