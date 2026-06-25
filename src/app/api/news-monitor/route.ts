import { NextResponse } from 'next/server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

interface EconomicEvent {
  id: string
  time: string
  country: string
  currency: string
  impact: 'high' | 'medium' | 'low'
  event: string
  forecast: string | null
  previous: string | null
  actual: string | null
}

const currencyFlags: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  CHF: '🇨🇭',
  CNY: '🇨🇳'
}

const impactEmojis: Record<string, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢'
}

function analyzeDataRelease(event: EconomicEvent): string {
  if (!event.actual || !event.forecast) return ''
  
  const actual = parseFloat(event.actual)
  const forecast = parseFloat(event.forecast)
  
  if (isNaN(actual) || isNaN(forecast)) return ''
  
  const diff = actual - forecast
  const percentDiff = ((diff / Math.abs(forecast)) * 100).toFixed(1)
  
  if (Math.abs(diff) < 0.01) {
    return 'Growth unchanged'
  } else if (diff > 0) {
    return `Higher than expected (+${percentDiff}%)`
  } else {
    return `Lower than expected (${percentDiff}%)`
  }
}

function formatTelegramAlert(events: EconomicEvent[]): string {
  if (events.length === 0) return ''
  
  const firstEvent = events[0]
  const flag = currencyFlags[firstEvent.currency] || '🌍'
  const time = new Date(firstEvent.time).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
  
  let message = `${flag} ${firstEvent.currency} Economic Release | ${time}\n\n`
  
  events.forEach(event => {
    const emoji = impactEmojis[event.impact] || '⚪'
    const analysis = analyzeDataRelease(event)
    
    message += `${emoji} ${event.event}: ${event.actual || 'N/A'} vs ${event.forecast || 'N/A'} forecast`
    
    if (analysis) {
      message += ` → ${analysis}`
    }
    message += '\n'
  })
  
  // Add market impact analysis
  const highImpactCount = events.filter(e => e.impact === 'high').length
  if (highImpactCount > 0) {
    message += '\n📌 High impact data could influence market sentiment and trading decisions'
  }
  
  return message
}

async function sendTelegramAlert(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured')
    return
  }
  
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      }
    )
    
    if (!response.ok) {
      console.error('Failed to send Telegram alert')
    }
  } catch (error) {
    console.error('Error sending Telegram alert:', error)
  }
}

export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Fetch calendar events
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://traders-world-ai.vercel.app'
    const calendarResponse = await fetch(`${baseUrl}/api/calendar`)
    const calendarData = await calendarResponse.json()
    
    if (!calendarData.success) {
      return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 })
    }
    
    // Filter events with actual data released in last 15 minutes
    const now = new Date()
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000)
    
    const recentReleases = calendarData.events.filter((event: EconomicEvent) => {
      const eventTime = new Date(event.time)
      return (
        event.actual !== null &&
        event.actual !== '' &&
        eventTime >= fifteenMinutesAgo &&
        eventTime <= now
      )
    })
    
    // Group by currency and time (events released together)
    const groupedReleases = recentReleases.reduce((acc: Record<string, EconomicEvent[]>, event: EconomicEvent) => {
      const key = `${event.currency}_${event.time}`
      if (!acc[key]) acc[key] = []
      acc[key].push(event)
      return acc
    }, {})
    
    // Send alerts for each group
    let alertsSent = 0
    for (const group of Object.values(groupedReleases)) {
      const message = formatTelegramAlert(group)
      if (message) {
        await sendTelegramAlert(message)
        alertsSent++
      }
    }
    
    return NextResponse.json({
      success: true,
      alertsSent,
      recentReleases: recentReleases.length
    })
    
  } catch (error) {
    console.error('Error in news monitor:', error)
    return NextResponse.json(
      { error: 'Failed to monitor news' },
      { status: 500 }
    )
  }
}
