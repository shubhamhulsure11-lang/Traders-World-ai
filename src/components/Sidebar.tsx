'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { icon: '⚡', label: 'Dashboard', href: '/' },
  { icon: '🌐', label: 'Globe', href: '/' },
  { icon: '📈', label: 'AI Analysis', href: '/analysis' },
  { icon: '📰', label: 'Live Feed', href: '/live-feed' },
  { icon: '🎯', label: 'Market Radar', href: '/' },
  { icon: '📅', label: 'Calendar AI', href: '/' },
  { icon: '🦦', label: 'Gold Intel', href: '/analysis/XAUUSD' },
  { icon: '🔗', label: 'Correlations', href: '/correlations' },
  { icon: '⏰', label: 'Sessions', href: '/sessions' },
  { icon: '🔔', label: 'Alerts', href: '/alerts' },
  { icon: '📓', label: 'Journal', href: '/' },
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
    <aside className={`${
      collapsed ? 'w-14' : 'w-56'
    } glass border-r border-[#0ea5e9]/15 flex flex-col transition-all duration-300 shrink-0 z-40`}>
      <div className="flex items-center justify-between p-4 border-b border-[#0ea5e9]/15">
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-[#0ea5e9] glow-text-blue tracking-wider">TRADELENS</h1>
            <p className="text-[9px] text-slate-600 tracking-widest uppercase">AI Market Intelligence</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-[#0ea5e9] transition-colors ml-auto"
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(item => (
          <Link
            key={item.label}
            href={item.href}
            className={`sidebar-item w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
              isActive(item.href, item.label)
                ? 'active text-[#0ea5e9]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-base shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="text-xs font-medium truncate">{item.label}</span>
            )}
          </Link>
        ))}
      </nav>
      {!collapsed && (
        <div className="p-4 border-t border-[#0ea5e9]/10">
          <p className="text-[9px] text-slate-700 text-center leading-relaxed">
            Built by<br/>
            <span className="text-[#0ea5e9]/60 font-medium">SHUBHAM HULSURE</span>
          </p>
        </div>
      )}
    </aside>
  )
}
