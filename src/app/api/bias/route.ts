import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ASSETS = [
  { symbol: 'XAUUSD', name: 'Gold',           yahoo: 'GC=F',       category: 'commodity' },
  { symbol: 'DXY',    name: 'US Dollar Index', yahoo: 'DX-Y.NYB',  category: 'fx' },
  { symbol: 'EURUSD', name: 'Euro / USD',      yahoo: 'EURUSD=X',   category: 'fx' },
  { symbol: 'BTC',    name: 'Bitcoin',         yahoo: 'BTC-USD',    category: 'crypto' },
  { symbol: 'ETH',    name: 'Ethereum',        yahoo: 'ETH-USD',    category: 'crypto' },
  { symbol: 'SPX',    name: 'S&P 500',         yahoo: '^GSPC',      category: 'equity' },
  { symbol: 'US10Y',  name: 'US 10Y Yield',    yahoo: '^TNX',       category: 'bond' },
]

// Macro correlations: DXY up = Gold down, etc.
const CORRELATIONS: Record<string, Record<string, number>> = {
  XAUUSD: { DXY: -0.85, US10Y: -0.65, SPX: 0.20 },
  DXY:    { XAUUSD: -0.85, EURUSD: -0.95, US10Y: 0.30 },
  EURUSD: { DXY: -0.95, XAUUSD: 0.50 },
  BTC:    { SPX: 0.60, ETH: 0.90 },
  ETH:    { BTC: 0.90, SPX: 0.55 },
  SPX:    { BTC: 0.60, US10Y: -0.40 },
  US10Y:  { XAUUSD: -0.65, SPX: -0.40, DXY: 0.30 },
}

async function fetchPrice(yahoo: string): Promise<{ price: number; changePct: number; prevClose: number } | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?interval=1d&range=5d`
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) })
    if (!res.ok) return null
    const json = await res.json()
    const meta = json?.chart?.result?.[0]?.meta
    if (!meta) return null
    const price = meta.regularMarketPrice ?? meta.previousClose
    const prevClose = meta.chartPreviousClose ?? meta.previousClose
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0
    return { price, changePct, prevClose }
  } catch { return null }
}

function computeBias(
  symbol: string,
  changePct: number,
  newsScore: number,   // -100 to +100 from news sentiment
  correlationScore: number // weighted correlation signal
): { bias: string; confidence: number; strength: string } {
  // Price momentum: strong weight
  const momentumScore = Math.max(-100, Math.min(100, changePct * 20))
  // Composite score
  const composite = (momentumScore * 0.45) + (newsScore * 0.35) + (correlationScore * 0.20)
  const bias = composite > 8 ? 'BULLISH' : composite < -8 ? 'BEARISH' : 'NEUTRAL'
  const confidence = Math.min(95, Math.max(45, Math.round(50 + Math.abs(composite) * 0.8)))
  const strength = Math.abs(composite) > 40 ? 'STRONG' : Math.abs(composite) > 20 ? 'MODERATE' : 'WEAK'
  return { bias, confidence, strength }
}

function buildReasoning(symbol: string, changePct: number, bias: string, newsItems: string[]): string[] {
  const reasons: string[] = []
  const dir = changePct > 0 ? 'up' : 'down'
  const pct = Math.abs(changePct).toFixed(2)
  reasons.push(`Price ${dir} ${pct}% on the session`)
  if (Math.abs(changePct) > 1) reasons.push(`Strong ${dir}side momentum detected`)
  if (newsItems.length > 0) reasons.push(newsItems[0])
  if (newsItems.length > 1) reasons.push(newsItems[1])
  // Asset-specific context
  if (symbol === 'XAUUSD') {
    if (bias === 'BULLISH') reasons.push('Safe-haven and inflation hedge demand active')
    else reasons.push('Risk-on environment reducing safe-haven flows')
  } else if (symbol === 'BTC') {
    if (bias === 'BULLISH') reasons.push('Crypto risk appetite elevated')
    else reasons.push('Crypto risk appetite reduced, profit-taking observed')
  } else if (symbol === 'DXY') {
    if (bias === 'BULLISH') reasons.push('Dollar strength on macro outperformance')
    else reasons.push('Dollar weakness on rate cut expectations')
  }
  return reasons.slice(0, 4)
}

export async function GET() {
  // Fetch live prices in parallel
  const priceData = await Promise.all(
    ASSETS.map(async a => ({ ...a, live: await fetchPrice(a.yahoo) }))
  )

  // Fetch recent news from Supabase for sentiment
  let newsMap: Record<string, { score: number; headlines: string[] }> = {}
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: newsRows } = await supabase
      .from('news_log')
      .select('assets, direction, impact_score, headline')
      .order('created_at', { ascending: false })
      .limit(50)
    for (const row of newsRows || []) {
      const assetList: string[] = Array.isArray(row.assets) ? row.assets : []
      for (const sym of assetList) {
        if (!newsMap[sym]) newsMap[sym] = { score: 0, headlines: [] }
        const sentimentVal = row.direction === 'bullish' ? (row.impact_score || 50) : row.direction === 'bearish' ? -(row.impact_score || 50) : 0
        newsMap[sym].score = (newsMap[sym].score + sentimentVal) / 2
        if (newsMap[sym].headlines.length < 2) newsMap[sym].headlines.push(row.headline)
      }
    }
  } catch { /* proceed without news */ }

  // Build bias for each asset
  const biases = priceData.map(asset => {
    const changePct = asset.live?.changePct ?? 0
    const newsScore = newsMap[asset.symbol]?.score ?? 0

    // Correlation score: look at correlated assets
    const corrs = CORRELATIONS[asset.symbol] || {}
    let correlationScore = 0
    let corrCount = 0
    for (const [corrSym, corrCoef] of Object.entries(corrs)) {
      const corrAsset = priceData.find(a => a.symbol === corrSym)
      if (corrAsset?.live) {
        correlationScore += corrAsset.live.changePct * corrCoef * 20
        corrCount++
      }
    }
    if (corrCount > 0) correlationScore /= corrCount

    const { bias, confidence, strength } = computeBias(asset.symbol, changePct, newsScore, correlationScore)
    const reasoning = buildReasoning(asset.symbol, changePct, bias, newsMap[asset.symbol]?.headlines ?? [])

    const price = asset.live?.price ?? 0
    return {
      asset: asset.symbol,
      name: asset.name,
      bias,
      strength,
      confidence,
      score: Math.round(50 + (bias === 'BULLISH' ? confidence - 50 : bias === 'BEARISH' ? -(confidence - 50) : 0)),
      reasoning,
      price,
      changePct: Number(changePct.toFixed(2)),
      keyLevel: Number((price * 0.995).toFixed(2)),
      target: Number((price * (bias === 'BULLISH' ? 1.015 : bias === 'BEARISH' ? 0.985 : 1.000)).toFixed(2)),
      stop: Number((price * (bias === 'BULLISH' ? 0.990 : bias === 'BEARISH' ? 1.010 : 0.995)).toFixed(2)),
      timeframe: '4H',
      dataSource: asset.live ? 'live' : 'cached',
      updatedAt: new Date().toISOString(),
    }
  })

  const liveCount = priceData.filter(a => a.live !== null).length
  return NextResponse.json({
    biases,
    source: liveCount >= 4 ? 'live_computed' : 'partial_live',
    liveCount,
    timestamp: new Date().toISOString(),
  })
}
