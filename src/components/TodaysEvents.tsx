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
  forecast: string | null
  previous: string | null
  aiConfidence?: number
  marketSentiment?: 'bullish' | 'bearish' | 'neutral'
}

export default function TodaysEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/calendar')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Filter only today's events
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)

          const todaysEvents = data.events.filter((event: CalendarEvent) => {
            const eventDate = new Date(event.time)
            return eventDate >= today && eventDate < tomorrow
          })

          setEvents(todaysEvents.slice(0, 5)) // Show max 5 events
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch events:', err)
        setLoading(false)
      })
  }, [])

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'high': return 'bg-red-500/20 border-red-500 text-red-300'
      case 'medium': return 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
      case 'low': return 'bg-green-500/20 border-green-500 text-green-300'
      default: return 'bg-gray-500/20 border-gray-500 text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          📅 Today's Economic Events
        </h3>
        <div className="animate-pulse text-cyan-400">Loading...</div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            📅 Today's Economic Events
          </h3>
          <Link href="/calendar-ai" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
            View All →
          </Link>
        </div>
        <p className="text-gray-500">No major events scheduled for today</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          📅 Today's Economic Events
        </h3>
        <Link href="/calendar-ai" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
          View All →
        </Link>
      </div>

      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="bg-black/30 border border-gray-800/50 rounded-lg p-4 hover:border-gray-700 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {event.currency === 'USD' && '🇺🇸'}
                    {event.currency === 'EUR' && '🇪🇺'}
                    {event.currency === 'GBP' && '🇬🇧'}
                    {event.currency === 'JPY' && '🇯🇵'}
                    {event.currency === 'AUD' && '🇦🇺'}
                    {event.currency === 'CAD' && '🇨🇦'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full border text-xs font-bold uppercase ${getImpactColor(event.impact)}`}>
                    {event.impact}
                  </span>
                </div>
                <h4 className="font-semibold text-white mb-1">{event.event}</h4>
                <p className="text-sm text-gray-400">{event.timeIST}</p>
              </div>
              <div className="text-right">
                {event.forecast && (
                  <div className="text-sm">
                    <span className="text-gray-500">F:</span>
                    <span className="text-yellow-400 ml-1">{event.forecast}</span>
                  </div>
                )}
                {event.previous && (
                  <div className="text-sm">
                    <span className="text-gray-500">P:</span>
                    <span className="text-gray-300 ml-1">{event.previous}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
