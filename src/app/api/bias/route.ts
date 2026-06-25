import { NextResponse } from 'next/server'

const MOCK_BIAS = [
  {
    asset: 'XAUUSD',
    name: 'Gold',
    bias: 'BULLISH',
    strength: 'STRONG',
    score: 84,
    confidence: 89,
    reasoning: [
      'Fed rate cut expectations rising - bullish for gold',
      'Central bank demand at multi-decade high',
      'Geopolitical tensions driving safe haven flows',
      'USD weakening supports gold prices',
    ],
    keyLevel: 2380,
    target: 2420,
    stop: 2340,
    timeframe: '4H',
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'EURUSD',
    name: 'Euro/USD',
    bias: 'BEARISH',
    strength: 'MODERATE',
    score: 62,
    confidence: 74,
    reasoning: [
      'Eurozone PMI contracting below 50',
      'ECB more dovish than Fed recently',
      'Energy concerns resurface in Europe',
      'DXY holding key support levels',
    ],
    keyLevel: 1.0850,
    target: 1.0720,
    stop: 1.0920,
    timeframe: '4H',
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'BTC',
    name: 'Bitcoin',
    bias: 'BULLISH',
    strength: 'STRONG',
    score: 78,
    confidence: 81,
    reasoning: [
      'ETF inflows accelerating - institutional demand',
      'Halving cycle momentum intact',
      'Risk-on sentiment supports crypto',
      'On-chain metrics show accumulation',
    ],
    keyLevel: 65000,
    target: 72000,
    stop: 61000,
    timeframe: '1D',
    updatedAt: new Date().toISOString(),
  },
  {
    asset: 'ETH',
    name: 'Ethereum',
    bias: 'NEUTRAL',
    strength: 'WEAK',
    score: 51,
    confidence: 58,
    reasoning: [
      'Awaiting ETF approval catalyst',
      'Network activity stable but not surging',
      'Lagging BTC momentum',
      'Key support holding at 3400',
    ],
    keyLevel: 3400,
    target: 3800,
    stop: 3200,
    timeframe: '4H',
    updatedAt: new Date().toISOString(),
  },
]

export async function GET() {
  return NextResponse.json({
    biases: MOCK_BIAS,
    overallMarketBias: 'RISK-ON',
    marketCondition: 'TRENDING',
    updatedAt: new Date().toISOString(),
  })
}
