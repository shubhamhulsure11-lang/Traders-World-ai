import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const YAHOO_SYMBOLS: Record<string, string> = {
  XAUUSD: 'GC=F',
  DXY: 'DX-Y.NYB',
  EURUSD: 'EURUSD=X',
  BTC: 'BTC-USD',
  ETH: 'ETH-USD',
  SPX: '^GSPC',
  US10Y: '^TNX',
}

const ASSET_NAMES: Record<string, string> = {
  XAUUSD: 'Gold',
  DXY: 'US Dollar Index',
  EURUSD: 'EUR/USD',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SPX: 'S&P 500',
  US10Y: 'US 10Y Yield',
}

async function fetchPrice(symbol: string): Promise<{ price: number; changePct: number } | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
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

async function sendTelegramAlert(symbol: string, price: number, changePct: number) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) return

  const direction = changePct > 0 ? '\u{1F7E2} BULLISH' : '\u{1F534} BEARISH'
  const arrow = changePct > 0 ? '\u2B06\uFE0F' : '\u2B07\uFE0F'
  const name = ASSET_NAMES[symbol] || symbol
  const absChange = Math.abs(changePct).toFixed(2)

  const text = `\u{1F6A8} <b>TradeLens AI \u2014 Major Move Alert</b>\n${direction} <b>${name} (${symbol})</b>\n\n${arrow} Change: <b>${changePct > 0 ? '+' : ''}${absChange}%</b>\n\u{1F4B0} Price: <b>${price}</b>\n\n\u26A0\uFE0F Move exceeds 1.5% threshold\n\u23F0 ${new Date().toUTCString()}\n\u2014 <i>TradeLens AI Auto-Alert</i>`

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const results: { symbol: string; success: boolean; changePct?: number; price?: number }[] = []

  await Promise.all(
    Object.entries(YAHOO_SYMBOLS).map(async ([assetSymbol, yahooSymbol]) => {
      const data = await fetchPrice(yahooSymbol)
      if (data) {
        await supabase.from('price_snapshots').insert({
          symbol: assetSymbol,
          price: data.price,
          change_pct: data.changePct,
        })
        results.push({ symbol: assetSymbol, success: true, changePct: data.changePct, price: data.price })

        // Fire Telegram alert for major moves (>1.5%)
        if (Math.abs(data.changePct) >= 1.5) {
          await sendTelegramAlert(assetSymbol, data.price, data.changePct)
        }
      } else {
        results.push({ symbol: assetSymbol, success: false })
      }
    })
  )

  const successCount = results.filter(r => r.success).length
  const alertsFired = results.filter(r => r.success && Math.abs(r.changePct ?? 0) >= 1.5).length

  return NextResponse.json({
    message: `Cron: refreshed ${successCount}/${results.length} assets, ${alertsFired} alert(s) fired`,
    results,
    timestamp: new Date().toISOString(),
  })
}
