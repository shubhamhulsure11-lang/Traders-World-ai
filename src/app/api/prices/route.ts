import { NextResponse } from 'next/server'

const MOCK_PRICES = [
  {
    symbol: 'XAUUSD',
    name: 'Gold',
    price: 2374.50,
    change: 12.30,
    changePct: 0.52,
    category: 'commodity',
    icon: '🥇',
  },
  {
    symbol: 'EURUSD',
    name: 'Euro/USD',
    price: 1.0842,
    change: -0.0018,
    changePct: -0.17,
    category: 'fx',
    icon: '💶',
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67420.00,
    change: 1240.00,
    changePct: 1.87,
    category: 'crypto',
    icon: '₿',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3521.00,
    change: -45.00,
    changePct: -1.26,
    category: 'crypto',
    icon: 'Ξ',
  },
]

export async function GET() {
  // Add slight random variation to simulate live prices
  const prices = MOCK_PRICES.map((asset) => ({
    ...asset,
    price: asset.price + (Math.random() - 0.5) * asset.price * 0.001,
    timestamp: new Date().toISOString(),
  }))

  return NextResponse.json({ prices, updatedAt: new Date().toISOString() })
}
