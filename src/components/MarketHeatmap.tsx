'use client'

import { useEffect, useState } from 'react'

interface Asset {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function MarketHeatmap() {
  const [assets, setAssets] = useState<Asset[]>([
    { symbol: 'XAUUSD', name: 'Gold', price: 4008.9, change: -172.45, changePercent: -4.14 },
    { symbol: 'BTCUSD', name: 'Bitcoin', price: 98234, change: 2453, changePercent: 2.56 },
    { symbol: 'ETHUSD', name: 'Ethereum', price: 3845, change: 125, changePercent: 3.36 },
    { symbol: 'EURUSD', name: 'EUR/USD', price: 1.0875, change: 0.0023, changePercent: 0.21 },
    { symbol: 'GBPUSD', name: 'GBP/USD', price: 1.2734, change: -0.0045, changePercent: -0.35 },
    { symbol: 'USDJPY', name: 'USD/JPY', price: 148.23, change: 0.87, changePercent: 0.59 },
    { symbol: 'US500', name: 'S&P 500', price: 5890, change: -23, changePercent: -0.39 },
    { symbol: 'USOIL', name: 'Crude Oil', price: 71.45, change: 1.23, changePercent: 1.75 }
  ])

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets(prevAssets =>
        prevAssets.map(asset => ({
          ...asset,
          change: asset.change + (Math.random() - 0.5) * 2,
          changePercent: asset.changePercent + (Math.random() - 0.5) * 0.5
        }))
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getColorIntensity = (changePercent: number) => {
    const absChange = Math.abs(changePercent)
    if (absChange < 0.5) return 'low'
    if (absChange < 1.5) return 'medium'
    return 'high'
  }

  const getBackgroundColor = (changePercent: number) => {
    const intensity = getColorIntensity(changePercent)
    if (changePercent > 0) {
      return intensity === 'high' ? 'bg-emerald-500/30' : intensity === 'medium' ? 'bg-emerald-500/20' : 'bg-emerald-500/10'
    } else {
      return intensity === 'high' ? 'bg-red-500/30' : intensity === 'medium' ? 'bg-red-500/20' : 'bg-red-500/10'
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {assets.map((asset) => (
        <div
          key={asset.symbol}
          className={`p-4 rounded-xl border transition-all duration-300 ${
            getBackgroundColor(asset.changePercent)
          } ${
            asset.changePercent > 0
              ? 'border-emerald-500/30 hover:border-emerald-500/50'
              : 'border-red-500/30 hover:border-red-500/50'
          }`}
        >
          <div className="text-xs text-slate-400 mb-1">{asset.name}</div>
          <div className="text-sm font-bold mb-1">{asset.symbol}</div>
          <div className="text-lg font-bold">
            {asset.price.toLocaleString()}
          </div>
          <div
            className={`text-sm font-medium ${
              asset.changePercent > 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {asset.changePercent > 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  )
}
