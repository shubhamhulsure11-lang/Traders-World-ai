import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured')
    return false
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { asset, bias, confidence, headline, impact, source, alertId } = body

    // Format the Telegram message
    const biasEmoji = bias === 'bullish' ? '🟢' : bias === 'bearish' ? '🔴' : 'ퟤ'
    const impactEmoji = impact === 'high' ? '🔴' : impact === 'medium' ? '🟡' : 'ퟤ'

    const message = `
<b>🚨 TradeLens AI Alert</b>
${biasEmoji} <b>${asset}</b> | ${bias?.toUpperCase()} | ${impactEmoji} ${impact?.toUpperCase()} IMPACT

<b>${headline}</b>

📊 Confidence: ${confidence}%
📰 Source: ${source}

⏰ ${new Date().toUTCString()}
— <i>TradeLens AI | Built by Shubham Hulsure</i>
    `.trim()

    const sent = await sendTelegramMessage(message)

    // Update telegram_sent flag in Supabase if alertId provided
    if (sent && alertId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase
        .from('alerts')
        .update({ telegram_sent: true })
        .eq('id', alertId)
    }

    return NextResponse.json({ success: sent, message: sent ? 'Alert sent to Telegram' : 'Telegram not configured' })
  } catch (err) {
    console.error('Telegram API error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
