'use client'
import { useEffect, useState } from 'react'

export default function AIStatusBar() {
  const [time, setTime] = useState('')
  const [processed, setProcessed] = useState(1247)

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    }
    update()
    const t = setInterval(() => {
      update()
      setProcessed(p => p + Math.floor(Math.random() * 3))
    }, 3000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="h-8 glass border-b border-[#0ea5e9]/10 flex items-center px-4 gap-6 text-[10px] font-mono">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
        <span className="text-emerald-400 font-semibold">AI ONLINE</span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-600">
        <span className="text-slate-700">•</span>
        <span>Sources Scanned:</span>
        <span className="text-slate-400">24</span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-600">
        <span>•</span>
        <span>News Processed:</span>
        <span className="text-[#0ea5e9]">{processed.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-600">
        <span>•</span>
        <span>Assets:</span>
        <span className="text-slate-400">4 Active</span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-600">
        <span>•</span>
        <span>Confidence:</span>
        <span className="text-emerald-400">HIGH</span>
      </div>
      <div className="ml-auto flex items-center gap-1.5 text-slate-700">
        <span>UTC</span>
        <span className="text-slate-500">{time}</span>
      </div>
    </div>
  )
}
