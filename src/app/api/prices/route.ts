import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ASSET_META: Record<string, { name: string; category: string; icon: string; yahoo: string }> = {
  XAUUSD: { name: 'Gold', category: 'commodity', icon: '🥇', yahoo: 'GC=F' },
  DXY:    { name: 'US Dollar Index', category: 'fx', icon: '💵', yahoo: 'DX-Y.NYB' },
  EURUSD: { name: 'Euro / USD', category: 'fx', icon: '🇪🇺', yahoo: 'EURUSD=X' },
  BTC:    { name: 'Bitcoin', category: 'crypto', icon: '₿', yahoo: 'BTC-USD' },
  ETH:    { name: 'Ethereum', category: 'crypto', icon: '⟠', yahoo: 'ETH-USD' },
  SPX:    { name: 'S&P 500', category: 'equity', icon: '📈', yahoo: '^GSPC' },
  US10Y:  { name: 'US 10Y Yield', category: 'bond', icon: '🏦', yahoo: '^TNX' },
}

async function fetchYahooPrice(symbol: string): Promise<{ price: number; changePct: number } | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const json = await res.json()
    const meta = json?.chart?.result?.[0]?.meta
    if (!meta) return null
    const price = meta.regularMarketPrice ?? meta.previousClose
    const prevClose = meta.chartPreviousClose ?? meta.previousClose
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0
    return { price: Number(price.toFixed(4)), changePct: Number(changePct.toFixed(2)) }
  } catch {
    return null
  }
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch all assets in parallel from Yahoo Finance
  const symbols = Object.keys(ASSET_META)
  const results = await Promise.all(
    symbols.map(async (sym) => {
      const meta = ASSET_META[sym]
      const live = await fetchYahooPrice(meta.yahoo)
      return { sym, meta, live }
    })
  )

  const liveCount = results.filter(r => r.live !== null).length

  // Save live prices to Supabase for persistence
  if (liveCount > 0) {
    const inserts = results
      .filter(r => r.live !== null)
      .map(r => ({ symbol: r.sym, price: r.live!.price, change_pct: r.live!.changePct }))
    await supabase.from('price_snapshots').insert(inserts)
  }

  // Build response — use live if available, else last Supabase snapshot
  let prices
  if (liveCount >= 4) {
    // Mostly live data — use Yahoo results
    prices = results.map(r => ({
      symbol: r.sym,
      name: r.meta.name,
      price: r.live?.price ?? 0,
      changePct: r.live?.changePct ?? 0,
      category: r.meta.category,
      icon: r.meta.icon,
    }))
  } else {
    // Fallback to Supabase
    const { data } = await supabase
      .from('price_snapshots')
      .select('symbol, price, change_pct, created_at')
      .order('created_at', { ascending: false })
    const seen = new Set<string>()
    prices = (data || []).filter(row => {
      if (seen.has(row.symbol)) return false
      seen.add(row.symbol)
      return true
    }).map(row => ({
      symbol: row.symbol,
      name: ASSET_META[row.symbol]?.name ?? row.symbol,
      price: Number(row.price),
      changePct: Number(row.change_pct),
      category: ASSET_META[row.symbol]?.category ?? 'other',
      icon: ASSET_META[row.symbol]?.icon ?? '📊',
    }))
  }

  return NextResponse.json({
    prices,
    source: liveCount >= 4 ? 'yahoo_finance_live' : 'supabase_cache',
    liveCount,
    timestamp: new Date().toISOString(),
  })
}
