'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CalendarEvent {
  id: string
  time: string
  timeIST: string
  country: string
  currency: string
  impact: 'high' | 'medium' | 'low'
  event: string
  actual: string | null
  forecast: string | null
  previous: string | null
  aiPrediction?: string
  aiConfidence?: number
  marketSentiment?: 'bullish' | 'bearish' | 'neutral'
}

export default function CalendarAIPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  useEffect(() => {
    fetch('/api/calendar')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEvents(data.events)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch calendar:', err)
        setLoading(false)
      })
  }, [])

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.impact === filter)

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'high': return 'bg-red-500/20 border-red-500 text-red-300'
      case 'medium': return 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
      case 'low': return 'bg-green-500/20 border-green-500 text-green-300'
      default: return 'bg-gray-500/20 border-gray-500 text-gray-300'
    }
  }

  const getSentimentColor = (sentiment?: string) => {
    switch(sentiment) {
      case 'bullish': return 'text-green-400'
      case 'bearish': return 'text-red-400'
      case 'neutral': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="text-cyan-400 hover:text-cyan-300">← Back</Link>
            <h1 className="text-4xl font-bold">📅 Calendar AI</h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-cyan-400">Loading economic events...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 inline-block mb-4">← Back to Dashboard</Link>
          <h1 className="text-4xl font-bold mb-2">📅 Calendar AI</h1>
          <p className="text-gray-400">AI-powered economic calendar with impact forecasting</p>
        </div>

        <div className="flex gap-3 mb-6">
          {(['all', 'high', 'medium', 'low'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                filter === f 
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' 
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} Impact
            </button>
          ))}
        </div>

        <div className="mb-6 text-gray-400">
          Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </div>

        <div className="space-y-4">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3">
                  <div className="text-sm text-gray-500 mb-1">Time (IST)</div>
                  <div className="font-mono text-cyan-400 mb-3">{event.timeIST}</div>
                  <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${getImpactColor(event.impact)}`}>
                    {event.impact}
                  </span>
                </div>

                <div className="md:col-span-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {event.currency === 'USD' && '🇺🇸'}
                      {event.currency === 'EUR' && '🇪🇺'}
                      {event.currency === 'GBP' && '🇬🇧'}
                      {event.currency === 'JPY' && '🇯🇵'}
                      {event.currency === 'AUD' && '🇦🇺'}
                      {event.currency === 'CAD' && '🇨🇦'}
                    </span>
                    <span className="font-bold text-sm text-gray-400">{event.currency}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{event.event}</h3>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Forecast:</span>
                      <span className="text-yellow-400 ml-1">{event.forecast || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Previous:</span>
                      <span className="text-gray-300 ml-1">{event.previous || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 bg-black/50 rounded-lg p-4 border border-cyan-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🤖</span>
                    <span className="text-sm font-bold text-cyan-400">AI Analysis</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{event.aiPrediction}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <span className="text-sm font-bold text-cyan-400 ml-1">{event.aiConfidence}%</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Sentiment:</span>
                      <span className={`text-sm font-bold ml-1 uppercase ${getSentimentColor(event.marketSentiment)}`}>
                        {event.marketSentiment}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No events found for the selected filter.
          </div>
        )}
      </div>
    </div>
  )
}
