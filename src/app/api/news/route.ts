import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// IST = UTC+5:30
function toIST(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    if (isNaN(d.getTime())) return 'just now'
    return d.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch { return 'just now' }
}

// Free RSS feeds
const RSS_FEEDS = [
  { url: 'https://feeds.reuters.com/reuters/businessNews', source: 'Reuters' },
  { url: 'https://feeds.reuters.com/reuters/topNews', source: 'Reuters' },
  { url: 'https://www.investing.com/rss/news.rss', source: 'Investing.com' },
  { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', source: 'MarketWatch' },
  { url: 'https://www.forexlive.com/feed/news', source: 'ForexLive' },
    // Central Banks & Financial Institutions
  { url: 'https://www.federalreserve.gov/feeds/press_all.xml', source: 'Federal Reserve' },
  { url: 'https://www.ecb.europa.eu/rss/press.html', source: 'ECB' },
  { url: 'https://www.bankofengland.co.uk/news.rss', source: 'Bank of England' },
  { url: 'https://www.boj.or.jp/en/rss/whatsnew.xml', source: 'Bank of Japan' },
  { url: 'https://home.treasury.gov/RSS/PressReleases', source: 'US Treasury' },
  { url: 'https://www.imf.org/en/News/RSS', source: 'IMF' },
  { url: 'https://www.worldbank.org/en/news/all.rss', source: 'World Bank' },
]

const ASSET_KEYWORDS: Record<string, string[]> = {
  XAUUSD: ['gold', 'xauusd', 'bullion', 'precious metal'],
  DXY:    ['dollar', 'dxy', 'usd', 'dollar index', 'greenback'],
  EURUSD: ['euro', 'eurusd', 'eur/usd', 'european central bank', 'ecb'],
  BTC:    ['bitcoin', 'btc', 'crypto', 'cryptocurrency'],
  ETH:    ['ethereum', 'eth', 'ether'],
  SPX:    ['s&p', 'spx', 'stock market', 'equities', 'wall street', 'nasdaq'],
  US10Y:  ['treasury', 'yield', 'bond', 'fed', 'federal reserve', 'fomc', 'interest rate'],
}

function tagAssets(text: string): string[] {
  const lower = text.toLowerCase()
  return Object.entries(ASSET_KEYWORDS)
    .filter(([, keywords]) => keywords.some(k => lower.includes(k)))
    .map(([sym]) => sym)
}

function scoreSentiment(text: string): { direction: string; impactScore: number } {
  const lower = text.toLowerCase()
  const bullish = ['surge', 'rally', 'rise', 'gain', 'jump', 'soar', 'high', 'bullish', 'strong', 'beat', 'boost', 'up']
  const bearish = ['fall', 'drop', 'plunge', 'decline', 'sink', 'weak', 'bearish', 'miss', 'cut', 'low', 'down', 'crash', 'slump']
  const highImpact = ['fed', 'federal reserve', 'fomc', 'cpi', 'inflation', 'gdp', 'recession', 'rate hike', 'rate cut', 'war', 'crisis', 'emergency']
  const bullScore = bullish.filter(w => lower.includes(w)).length
  const bearScore = bearish.filter(w => lower.includes(w)).length
  const direction = bullScore > bearScore ? 'bullish' : bearScore > bullScore ? 'bearish' : 'neutral'
  const isHighImpact = highImpact.some(w => lower.includes(w))
  const impactScore = isHighImpact ? Math.min(95, 60 + bullScore * 5 + bearScore * 5) : Math.min(75, 40 + bullScore * 4 + bearScore * 4)
  return { direction, impactScore }
}

async function fetchRSSFeed(feedUrl: string, source: string) {
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'TradeLensAI/1.0 (market intelligence bot)' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items: Array<{ title: string; pubDate: string; link: string }> = []
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g
    const titleRegex = /<title>(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]*))<\/title>/
    const dateRegex = /<pubDate>([^<]+)<\/pubDate>/
    const linkRegex = /<link>([^<]+)<\/link>|<link[^>]+href="([^"]+)"/
    let match
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[0]
      const titleMatch = itemXml.match(titleRegex)
      const dateMatch = itemXml.match(dateRegex)
      const linkMatch = itemXml.match(linkRegex)
      if (titleMatch) {
        items.push({
          title: (titleMatch[1] || titleMatch[2] || '').trim(),
          pubDate: dateMatch ? dateMatch[1] : new Date().toISOString(),
          link: linkMatch ? (linkMatch[1] || linkMatch[2] || '').trim() : '',
        })
      }
      if (items.length >= 8) break
    }
    return items.map(item => ({ ...item, source }))
  } catch { return [] }
}

export async function GET() {
  try {
    const feedResults = await Promise.all(
      RSS_FEEDS.map(f => fetchRSSFeed(f.url, f.source))
    )
    const allItems = feedResults.flat()

    const relevant = allItems
      .map(item => {
        const assets = tagAssets(item.title)
        const { direction, impactScore } = scoreSentiment(item.title)
        return { item, assets, direction, impactScore }
      })
      .filter(r => r.assets.length > 0)
      .slice(0, 15)

    if (relevant.length >= 3) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const inserts = relevant.map(r => ({
        headline: r.item.title,
        source: r.item.source,
        impact: r.impactScore >= 70 ? 'high' : r.impactScore >= 45 ? 'medium' : 'low',
        impact_score: r.impactScore,
        assets: r.assets,
        direction: r.direction,
        category: r.assets.includes('BTC') || r.assets.includes('ETH') ? 'crypto' : r.assets.includes('XAUUSD') ? 'commodities' : 'macro',
        region: 'global',
        summary: r.item.title,
      }))
      await supabase.from('news_log').insert(inserts)

      const news = relevant.map((r, i) => ({
        id: String(i),
        headline: r.item.title,
        source: r.item.source,
        link: r.item.link || '',
        time: toIST(r.item.pubDate),
        timeLabel: 'IST',
        impact: r.impactScore >= 70 ? 'HIGH' : r.impactScore >= 45 ? 'MEDIUM' : 'LOW',
        impactScore: r.impactScore,
        assets: r.assets,
        direction: r.direction.toUpperCase(),
        confidence: r.impactScore,
        category: r.assets.includes('BTC') ? 'crypto' : r.assets.includes('XAUUSD') ? 'commodities' : 'macro',
        region: 'global',
        summary: r.item.title,
      }))
      return NextResponse.json({ news, source: 'rss_live', count: news.length, timestamp: new Date().toISOString() })
    }
  } catch (err) {
    console.error('RSS fetch error:', err)
  }

  // Fallback to Supabase
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from('news_log')
      .select('id, headline, source, impact, impact_score, assets, direction, category, region, summary, created_at')
      .order('created_at', { ascending: false })
      .limit(15)
    const news = (data || []).map(row => ({
      id: row.id,
      headline: row.headline,
      source: row.source,
      link: '',
      time: toIST(row.created_at),
      timeLabel: 'IST',
      impact: (row.impact || 'medium').toUpperCase(),
      impactScore: row.impact_score || 50,
      assets: Array.isArray(row.assets) ? row.assets : [],
      direction: (row.direction || 'neutral').toUpperCase(),
      confidence: row.impact_score || 50,
      category: row.category || 'macro',
      region: row.region || 'global',
      summary: row.summary || row.headline,
    }))
    return NextResponse.json({ news, source: 'supabase_cache', timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ news: [], source: 'error', timestamp: new Date().toISOString() })
  }
}
