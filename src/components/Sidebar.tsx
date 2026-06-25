'use client'
import { useState } from 'react'

const NAV = [
  { icon: '⚡', label: 'Dashboard', active: true },
  { icon: '🌐', label: 'Globe' },
  { icon: '📈', label: 'AI Analysis' },
  { icon: '📰', label: 'Live Feed' },
  { icon: '🎯', label: 'Market Radar' },
  { icon: '📅', label: 'Calendar AI' },
  { icon: '🦥', label: 'Gold Intel' },
  { icon: '🔗', label: 'Correlations' },
  { icon: '⏰', label: 'Sessions' },
  { icon: '🔔', label: 'Alerts' },
  { icon: '📓', label: 'Journal' },
  { icon: '⚙️', label: 'Settings' },
]

export default function Sidebar() {
  const [active, setActive] = useState('Dashboard')
  const [collapsed, setCollapsed] = useState(false)

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
          <button
            key={item.label}
            onClick={() => setActive(item.label)}
            className={`sidebar-item w-full flex items-center gap-3 px-4 py-2.5 text-left ${
              active === item.label
                ? 'active text-[#0ea5e9]'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-base shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="text-xs font-medium truncate">{item.label}</span>
            )}
          </button>
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
