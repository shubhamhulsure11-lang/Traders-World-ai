'use client'
import { useEffect, useRef } from 'react'

export default function TradingViewTickerTape() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      "symbols": [
        {
          "proName": "FX_IDC:XAUUSD",
          "title": "Gold"
        },
        {
          "proName": "BINANCE:BTCUSDT",
          "title": "Bitcoin"
        },
        {
          "proName": "BINANCE:ETHUSDT",
          "title": "Ethereum"
        },
        {
          "description": "Dollar Index",
          "proName": "TVC:DXY"
        },
        {
          "description": "EUR/USD",
          "proName": "FX:EURUSD"
        },
        {
          "description": "GBP/USD",
          "proName": "FX:GBPUSD"
        },
        {
          "description": "S&P 500",
          "proName": "FOREXCOM:SPXUSD"
        },
        {
          "description": "Nasdaq 100",
          "proName": "FOREXCOM:NSXUSD"
        }
      ],
      "showSymbolLogo": true,
      "isTransparent": true,
      "displayMode": "adaptive",
      "colorTheme": "dark",
      "locale": "en"
    })

    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div 
      className="tradingview-widget-container" 
      ref={containerRef}
      style={{ height: '46px', width: '100%' }}
    >
      <div className="tradingview-widget-container__widget"></div>
    </div>
  )
}
