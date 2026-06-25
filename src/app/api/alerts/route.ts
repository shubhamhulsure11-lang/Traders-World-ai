import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('alerts')
      .select('id, asset, bias, confidence, headline, impact, source, telegram_sent, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    const alerts = (data || []).map((row) => ({
      id: row.id,
      asset: row.asset,
      bias: row.bias,
      confidence: row.confidence || 75,
      headline: row.headline,
      impact: row.impact,
      source: row.source,
      telegramSent: row.telegram_sent,
      createdAt: row.created_at,
    }))

    return NextResponse.json({ alerts, source: 'supabase', timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('Alerts API error:', err)
    return NextResponse.json({ alerts: [], source: 'error', timestamp: new Date().toISOString() }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { asset, bias, confidence, headline, impact, source } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from('alerts')
      .insert([{ asset, bias, confidence, headline, impact, source }])
      .select()

    if (error) throw error

    return NextResponse.json({ alert: data?.[0], success: true })
  } catch (err) {
    console.error('Alert POST error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
