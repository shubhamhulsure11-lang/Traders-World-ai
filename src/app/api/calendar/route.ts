import { NextResponse } from 'next/server'

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

// AI-powered impact assessment based on event type and historical patterns
function getAIImpactAssessment(event: string, forecast: string | null, previous: string | null): {
  prediction: string
  confidence: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
} {
  const eventLower = event.toLowerCase()
  
  // High-impact indicators
  const highImpactKeywords = ['nfp', 'gdp', 'interest rate', 'fomc', 'cpi', 'unemployment', 'retail sales', 'pmi']
  const isHighImpact = highImpactKeywords.some(keyword => eventLower.includes(keyword))
  
  let confidence = 0.5
  let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral'
  let prediction = 'Monitoring market conditions'
  
  if (isHighImpact) {
    confidence = 0.75
    
    if (eventLower.includes('nfp') || eventLower.includes('employment')) {
      prediction = 'Strong employment data typically strengthens currency'
      sentiment = forecast && previous && parseFloat(forecast) > parseFloat(previous) ? 'bullish' : 'bearish'
    } else if (eventLower.includes('cpi') || eventLower.includes('inflation')) {
      prediction = 'Higher inflation may lead to hawkish central bank stance'
      sentiment = forecast && previous && parseFloat(forecast) > parseFloat(previous) ? 'bullish' : 'bearish'
    } else if (eventLower.includes('gdp')) {
      prediction = 'GDP growth signals economic strength'
      sentiment = forecast && previous && parseFloat(forecast) > parseFloat(previous) ? 'bullish' : 'bearish'
    } else if (eventLower.includes('interest rate') || eventLower.includes('fomc')) {
      prediction = 'Rate decisions have major market impact'
      confidence = 0.85
      sentiment = 'neutral'
    }
  }
  
  return { prediction, confidence, sentiment }
}

// Generate realistic economic calendar data
function generateMockCalendarData(): CalendarEvent[] {
  const now = new Date()
  const events: CalendarEvent[] = []
  
  const economicEvents = [
    { event: 'US Non-Farm Payrolls', country: 'USD', currency: 'USD', impact: 'high' as const, forecast: '200K', previous: '187K' },
    { event: 'US CPI (Consumer Price Index)', country: 'USD', currency: 'USD', impact: 'high' as const, forecast: '3.2%', previous: '3.0%' },
    { event: 'ECB Interest Rate Decision', country: 'EUR', currency: 'EUR', impact: 'high' as const, forecast: '4.50%', previous: '4.50%' },
    { event: 'US Unemployment Rate', country: 'USD', currency: 'USD', impact: 'high' as const, forecast: '3.9%', previous: '3.8%' },
    { event: 'UK GDP Growth Rate', country: 'GBP', currency: 'GBP', impact: 'high' as const, forecast: '0.2%', previous: '0.1%' },
    { event: 'Japan Core CPI', country: 'JPY', currency: 'JPY', impact: 'medium' as const, forecast: '2.5%', previous: '2.4%' },
    { event: 'US Retail Sales', country: 'USD', currency: 'USD', impact: 'high' as const, forecast: '0.5%', previous: '0.3%' },
    { event: 'Germany Manufacturing PMI', country: 'EUR', currency: 'EUR', impact: 'medium' as const, forecast: '42.5', previous: '41.8' },
    { event: 'FOMC Meeting Minutes', country: 'USD', currency: 'USD', impact: 'high' as const, forecast: null, previous: null },
    { event: 'Australia Employment Change', country: 'AUD', currency: 'AUD', impact: 'medium' as const, forecast: '20K', previous: '15K' },
    { event: 'Canada Interest Rate Decision', country: 'CAD', currency: 'CAD', impact: 'high' as const, forecast: '5.00%', previous: '5.00%' },
    { event: 'US Initial Jobless Claims', country: 'USD', currency: 'USD', impact: 'medium' as const, forecast: '210K', previous: '205K' },
    { event: 'Eurozone Industrial Production', country: 'EUR', currency: 'EUR', impact: 'low' as const, forecast: '-0.3%', previous: '-0.6%' },
    { event: 'US Producer Price Index', country: 'USD', currency: 'USD', impact: 'medium' as const, forecast: '1.2%', previous: '0.9%' },
    { event: 'UK Bank of England Interest Rate', country: 'GBP', currency: 'GBP', impact: 'high' as const, forecast: '5.25%', previous: '5.25%' },
  ]
  
  economicEvents.forEach((evt, index) => {
    const eventDate = new Date(now)
    eventDate.setDate(now.getDate() + Math.floor(index / 3))
    eventDate.setHours(8 + (index % 3) * 4, 30, 0, 0)
    
    const istDate = new Date(eventDate.getTime() + (5.5 * 60 * 60 * 1000))
    
    const aiAssessment = getAIImpactAssessment(evt.event, evt.forecast, evt.previous)
    
    events.push({
      id: `evt_${index + 1}`,
      time: eventDate.toISOString(),
      timeIST: istDate.toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      country: evt.country,
      currency: evt.currency,
      impact: evt.impact,
      event: evt.event,
      actual: null,
      forecast: evt.forecast,
      previous: evt.previous,
      aiPrediction: aiAssessment.prediction,
      aiConfidence: Math.round(aiAssessment.confidence * 100),
      marketSentiment: aiAssessment.sentiment
    })
  })
  
  events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
  
  return events
}

export async function GET() {
  try {
    const events = generateMockCalendarData()
    
    return NextResponse.json({
      success: true,
      events,
      updated: new Date().toISOString(),
      count: events.length
    })
  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar data' },
      { status: 500 }
    )
  }
}
