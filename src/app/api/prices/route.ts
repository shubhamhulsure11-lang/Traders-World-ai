import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ASSET_META: Record<string, { name: string; category: string; icon: string }> = {
  XAUUSD: { name: 'Gold', category: 'commodity', icon: '🥇' },
  DXY: { name: 'US Dollar Index', category: 'fx', icon: '💵' },
  EURUSD: { name: 'Euro/USD', category: 'fx', icon: '🇪🇺' },
  BTC: { name: 'Bitcoin', category: 'crypto', icon: '₿' },
  ETH: { name: 'Ethereum', category: 'crypto', icon: '⟠' },
  SPX: { name: 'S&P 500', category: 'equity', icon: '📈' },
  US10Y: { name: 'US 10Y Yield', category: 'bond', icon: '🏦' },
}

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('price_snapshots')
      .select('symbol, price, change_pct, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Deduplicate: keep latest per symbol
    const seen = new Set<string>()
    const prices = (data || []).filter((row) => {
      if (seen.has(row.symbol)) return false
      seen.add(row.symbol)
      return true
    }).map((row) => ({
      symbol: row.symbol,
      name: ASSET_META[row.symbol]?.name || row.symbol,
      price: Number(row.price),
      change: 0,
      changePct: Number(row.change_pct),
      category: ASSET_META[row.symbol]?.category || 'other',
      icon: ASSET_META[row.symbol]?.icon || '📊',
    }))

    return NextResponse.json({ prices, source: 'supabase', timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('Prices API error:', err)
    // Fallback to mock data if Supabase fails
    return NextResponse.json({
      prices: [
        { symbol: 'XAUUSD', name: 'Gold', price: 2338.50, change: 12.30, changePct: 0.42, category: 'commodity', icon: '🥇' },
        { symbol: 'DXY', name: 'US Dollar Index', price: 104.23, change: -0.15, changePct: -0.14, category: 'fx', icon: '💵' },
        { symbol: 'EURUSD', name: 'Euro/USD', price: 1.0812, change: 0.0018, changePct: 0.18, category: 'fx', icon: '🇪🇺' },
        { symbol: 'BTC', name: 'Bitcoin', price: 67450.00, change: 820.00, changePct: 1.23, category: 'crypto', icon: '₿' },
        { symbol: 'ETH', name: 'Ethereum', price: 3520.00, change: 30.00, changePct: 0.87, category: 'crypto', icon: '⟠' },
        { symbol: 'SPX', name: 'S&P 500', price: 5280.00, change: 16.00, changePct: 0.31, category: 'equity', icon: '📈' },
        { symbol: 'US10Y', name: 'US 10Y Yield', price: 4.42, change: -0.02, changePct: -0.45, category: 'bond', icon: '🏦' },
      ],
      source: 'fallback',
      timestamp: new Date().toISOString()
    })
  }
}
