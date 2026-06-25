'use client'
import { useState, useEffect, useRef } from 'react'
import { BinanceStream, LivePrice, getLivePrice, isMarketOpen } from '@/lib/market-data'

interface TickerAsset {
  symbol: string
  displayName: string
  type: 'crypto' | 'forex' | 'index'
}

const TICKER_ASSETS: TickerAsset[] = [
  { symbol: 'BTC', displayName: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH', displayName: 'Ethereum', type: 'crypto' },
  { symbol: 'XAUUSD', displayName: 'Gold', type: 'forex' },
  { symbol: 'DXY', displayName: 'Dollar Index', type: 'index' },
  { symbol: 'EURUSD', displayName: 'EUR/USD', type: 'forex' },
  { symbol: 'GBPUSD', displayName: 'GBP/USD', type: 'forex' },
  { symbol: 'SPX', displayName: 'S&P 500', type: 'index' },
  { symbol: 'US100', displayName: 'Nasdaq', type: 'index' }
]

export default function LivePriceTicker() {
  const [prices, setPrices] = useState<Map<string, LivePrice>>(new Map())
  const [isLive, setIsLive] = useState(true)
  const binanceRef = useRef<BinanceStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Initialize Binance WebSocket for crypto
        // Initialize with realistic mock prices
    const initialPrices = new Map<string, LivePrice>([
      ['XAUUSD', { symbol: 'XAUUSD', price: 4008.90, change: -172.45, changePercent: -4.14, volume: 142500000000, timestamp: Date.now(), high24h: 4198.35, low24h: 3988.12 }],
      ['DXY', { symbol: 'DXY', price: 104.25, change: 0.43, changePercent: 0.41, volume: 0, timestamp: Date.now() }],
      ['EURUSD', { symbol: 'EURUSD', price: 1.0850, change: -0.0075, changePercent: -0.69, volume: 0, timestamp: Date.now() }],
      ['GBPUSD', { symbol: 'GBPUSD', price: 1.2675, change: -0.0042, changePercent: -0.33, volume: 0, timestamp: Date.now() }],
      ['SPX', { symbol: 'SPX', price: 5488.25, change: 12.50, changePercent: 0.23, volume: 3800000000, timestamp: Date.now() }],
      ['US100', { symbol: 'US100', price: 19875.40, change: -45.20, changePercent: -0.23, volume: 2500000000, timestamp: Date.now() }]
    ])
    setPrices(initialPrices)

    binanceRef.current = new BinanceStream()
    binanceRef.current.connect(['BTC', 'ETH'])
    
    // Subscribe to crypto updates
    binanceRef.current.subscribe('BTC', (data) => {
      setPrices(prev => new Map(prev).set('BTC', data))
    })
    binanceRef.current.subscribe('ETH', (data) => {
      setPrices(prev => new Map(prev).set('ETH', data))
    })

    // Fetch forex/indices prices every 10 seconds
    const fetchPrices = async () => {
      const forexIndices = ['XAUUSD', 'DXY', 'EURUSD', 'GBPUSD', 'SPX', 'US100']
      
      for (const symbol of forexIndices) {
        const price = await getLivePrice(symbol)
        if (price) {
          setPrices(prev => new Map(prev).set(symbol, price))
        }
      }
    }

    fetchPrices() // Initial fetch
    intervalRef.current = setInterval(fetchPrices, 10000) // Every 10 seconds

    return () => {
      if (binanceRef.current) {
        binanceRef.current.disconnect()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const getChangeColor = (change: number) => {
    if (change > 0.5) return 'text-emerald-400 bg-emerald-500/10'
    if (change > 0) return 'text-emerald-400 bg-emerald-500/5'
    if (change < -0.5) return 'text-red-400 bg-red-500/10'
    if (change < 0) return 'text-red-400 bg-red-500/5'
    return 'text-slate-400 bg-slate-500/5'
  }

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === 'BTC' || symbol === 'ETH') {
      return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
    }
    if (symbol === 'XAUUSD') {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1a]/95 backdrop-blur-xl border-b border-[#0ea5e9]/10">
      <div className="overflow-hidden">
        <div className="flex items-center gap-1 animate-ticker py-2 px-4">
          {/* Live indicator */}
          <div className="flex items-center gap-2 mr-6 flex-shrink-0">
            <div className="relative">
              <div className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-emerald-400' : 'bg-slate-400'
              }`} />
              {isLive && (
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <span className="text-xs font-medium text-slate-400">LIVE</span>
          </div>

          {/* Price tickers */}
          {TICKER_ASSETS.map(asset => {
            const price = prices.get(asset.symbol)
            if (!price) return null

            return (
              <div
                key={asset.symbol}
                className="flex items-center gap-3 px-4 py-1.5 rounded-lg glass hover:bg-white/5 transition-all cursor-pointer flex-shrink-0"
              >
                {/* Symbol */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400">{asset.symbol}</span>
                  <span className="text-xs text-slate-500">{asset.displayName}</span>
                </div>

                {/* Price */}
                <span className="text-sm font-mono font-bold">
                  {asset.symbol === 'BTC' || asset.symbol === 'ETH' ? '$' : ''}
                  {formatPrice(price.price, asset.symbol)}
                </span>

                {/* Change */}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  getChangeColor(price.changePercent)
                }`}>
                  {price.changePercent > 0 ? '+' : ''}
                  {price.changePercent.toFixed(2)}%
                </span>

                {/* Movement arrow */}
                {Math.abs(price.changePercent) > 0.1 && (
                  <div className={`${
                    price.changePercent > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {price.changePercent > 0 ? '▲' : '▼'}
                  </div>
                )}
              </div>
            )
          })}

          {/* Market status */}
          <div className="flex items-center gap-4 ml-6 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                isMarketOpen('crypto') ? 'bg-emerald-400' : 'bg-slate-600'
              }`} />
              <span className="text-xs text-slate-400">Crypto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                isMarketOpen('forex') ? 'bg-emerald-400' : 'bg-slate-600'
              }`} />
              <span className="text-xs text-slate-400">Forex</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                isMarketOpen('stocks') ? 'bg-emerald-400' : 'bg-slate-600'
              }`} />
              <span className="text-xs text-slate-400">Stocks</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          display: flex;
          width: max-content;
        }
      `}</style>
    </div>
  )
}
