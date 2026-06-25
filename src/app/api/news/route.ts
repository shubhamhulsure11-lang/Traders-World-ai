import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('news_log')
      .select('id, headline, source, impact, impact_score, assets, direction, category, region, summary, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    const news = (data || []).map((row) => ({
      id: row.id,
      headline: row.headline,
      source: row.source,
      time: row.created_at ? new Date(row.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' ago' : 'just now',
      impact: (row.impact || 'medium').toUpperCase(),
      impactScore: row.impact_score || 50,
      assets: Array.isArray(row.assets) ? row.assets : (row.assets ? Object.values(row.assets) : []),
      direction: (row.direction || 'neutral').toUpperCase(),
      confidence: row.impact_score || 50,
      category: row.category || 'general',
      region: row.region || 'global',
      summary: row.summary || row.headline,
    }))

    return NextResponse.json({ news, source: 'supabase', timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('News API error:', err)
    // Fallback mock news
    return NextResponse.json({
      news: [
        {
          id: '1',
          headline: 'Fed holds rates steady — Gold and bonds rally',
          source: 'Reuters',
          time: '2 min ago',
          impact: 'HIGH',
          impactScore: 85,
          assets: ['XAUUSD', 'US10Y', 'DXY'],
          direction: 'BULLISH',
          confidence: 82,
          category: 'monetary_policy',
          region: 'US',
          summary: 'Federal Reserve maintains rates; markets interpret as dovish pivot signal.',
        },
        {
          id: '2',
          headline: 'Gold demand surges as central banks increase reserves',
          source: 'Bloomberg',
          time: '8 min ago',
          impact: 'HIGH',
          impactScore: 88,
          assets: ['XAUUSD'],
          direction: 'BULLISH',
          confidence: 85,
          category: 'commodities',
          region: 'global',
          summary: 'Central bank gold purchases hit 55-year high, supporting prices above $2300.',
        },
        {
          id: '3',
          headline: 'BTC breaks 67K resistance on ETF inflows',
          source: 'CoinDesk',
          time: '15 min ago',
          impact: 'MEDIUM',
          impactScore: 70,
          assets: ['BTC', 'ETH'],
          direction: 'BULLISH',
          confidence: 74,
          category: 'crypto',
          region: 'global',
          summary: 'Bitcoin ETF net inflows exceeded $500M driving breakout above key resistance.',
        },
      ],
      source: 'fallback',
      timestamp: new Date().toISOString()
    })
  }
}
