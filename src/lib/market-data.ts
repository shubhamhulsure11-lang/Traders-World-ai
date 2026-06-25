// Live market data utilities using free APIs

export interface LivePrice {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: number
  bid?: number
  ask?: number
  high24h?: number
  low24h?: number
}

export interface MarketTick {
  symbol: string
  price: number
  timestamp: number
  volume: number
}

// Binance WebSocket for crypto (FREE, unlimited)
export class BinanceStream {
  private ws: WebSocket | null = null
  private callbacks: Map<string, (data: LivePrice) => void> = new Map()

  connect(symbols: string[]) {
    const streams = symbols.map(s => `${s.toLowerCase()}usdt@ticker`).join('/')
    this.ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.data) {
        const ticker = data.data
        const livePrice: LivePrice = {
          symbol: ticker.s.replace('USDT', ''),
          price: parseFloat(ticker.c),
          change: parseFloat(ticker.p),
          changePercent: parseFloat(ticker.P),
          volume: parseFloat(ticker.v),
          timestamp: ticker.E,
          bid: parseFloat(ticker.b),
          ask: parseFloat(ticker.a),
          high24h: parseFloat(ticker.h),
          low24h: parseFloat(ticker.l)
        }
        const callback = this.callbacks.get(livePrice.symbol)
        if (callback) callback(livePrice)
      }
    }
  }

  subscribe(symbol: string, callback: (data: LivePrice) => void) {
    this.callbacks.set(symbol, callback)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Twelve Data API for Forex/Indices (FREE: 800 calls/day)
export async function getTwelveDataPrice(symbol: string): Promise<LivePrice | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TWELVE_DATA_KEY || 'demo'
    const response = await fetch(
      `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`
    )
    const data = await response.json()
    
    if (data.price) {
      return {
        symbol: data.symbol,
        price: parseFloat(data.close),
        change: parseFloat(data.change),
        changePercent: parseFloat(data.percent_change),
        volume: parseFloat(data.volume || '0'),
        timestamp: Date.now(),
        high24h: parseFloat(data.high),
        low24h: parseFloat(data.low)
      }
    }
  } catch (error) {
    console.error('Twelve Data error:', error)
  }
  return null
}

// Polygon.io for stocks (FREE: 5 calls/min)
export async function getPolygonPrice(symbol: string): Promise<LivePrice | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_KEY
    if (!apiKey) return null
    
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${apiKey}`
    )
    const data = await response.json()
    
    if (data.results && data.results[0]) {
      const result = data.results[0]
      return {
        symbol,
        price: result.c,
        change: result.c - result.o,
        changePercent: ((result.c - result.o) / result.o) * 100,
        volume: result.v,
        timestamp: result.t,
        high24h: result.h,
        low24h: result.l
      }
    }
  } catch (error) {
    console.error('Polygon error:', error)
  }
  return null
}

// Fallback: Yahoo Finance (scraping, FREE unlimited)
export async function getYahooFinancePrice(symbol: string): Promise<LivePrice | null> {
  try {
    const response = await fetch(`/api/yahoo-price?symbol=${symbol}`)
    return await response.json()
  } catch (error) {
    console.error('Yahoo Finance error:', error)
  }
  return null
}

// Smart price fetcher - tries multiple sources
export async function getLivePrice(symbol: string): Promise<LivePrice | null> {
  // For crypto, use Binance (real-time WebSocket available)
  if (['BTC', 'ETH', 'BNB', 'SOL', 'XRP'].includes(symbol)) {
    // WebSocket connection handled separately
    return null // Use BinanceStream class for real-time
  }
  
  // For forex/indices, try Twelve Data first
  if (symbol.includes('USD') || symbol.includes('JPY') || ['DXY', 'SPX', 'US100'].includes(symbol)) {
    const price = await getTwelveDataPrice(symbol)
    if (price) return price
  }
  
  // For stocks, try Polygon
  const polygonPrice = await getPolygonPrice(symbol)
  if (polygonPrice) return polygonPrice
  
  // Fallback to Yahoo Finance
  return await getYahooFinancePrice(symbol)
}

// Market status checker
export function isMarketOpen(market: 'forex' | 'crypto' | 'stocks' = 'forex'): boolean {
  if (market === 'crypto') return true // 24/7
  
  const now = new Date()
  const day = now.getUTCDay()
  const hour = now.getUTCHours()
  
  if (market === 'forex') {
    // Forex: Sun 22:00 UTC - Fri 22:00 UTC
    if (day === 6 || (day === 0 && hour < 22) || (day === 5 && hour >= 22)) {
      return false
    }
    return true
  }
  
  if (market === 'stocks') {
    // US stocks: Mon-Fri 13:30-20:00 UTC (9:30am-4pm EST)
    if (day === 0 || day === 6) return false
    return hour >= 13 && hour < 20
  }
  
  return false
}

// Price change momentum detector
export function getMomentum(prices: number[]): 'strong-up' | 'up' | 'neutral' | 'down' | 'strong-down' {
  if (prices.length < 2) return 'neutral'
  
  const recent = prices.slice(-5)
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length
  const last = prices[prices.length - 1]
  const change = ((last - avg) / avg) * 100
  
  if (change > 0.5) return 'strong-up'
  if (change > 0.1) return 'up'
  if (change < -0.5) return 'strong-down'
  if (change < -0.1) return 'down'
  return 'neutral'
}
