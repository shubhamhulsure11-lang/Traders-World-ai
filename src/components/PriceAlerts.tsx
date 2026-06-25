'use client'

import { useEffect, useState } from 'react'
import { Bell, TrendingUp, TrendingDown } from 'lucide-react'

interface PriceAlert {
  id: string
  asset: string
  type: 'increase' | 'decrease'
  threshold: number
  currentPrice: number
  message: string
  timestamp: Date
}

export default function PriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [showNotification, setShowNotification] = useState(false)

  // Simulate price monitoring and alerts
  useEffect(() => {
    const mockAlerts: PriceAlert[] = [
      {
        id: '1',
        asset: 'XAUUSD',
        type: 'decrease',
        threshold: 4010,
        currentPrice: 4008.9,
        message: 'Gold dropped below $4,010',
        timestamp: new Date()
      }
    ]

    // Simulate adding alerts over time
    const interval = setInterval(() => {
      const random = Math.random()
      if (random > 0.7) {
        const newAlert: PriceAlert = {
          id: Date.now().toString(),
          asset: ['XAUUSD', 'BTCUSD', 'EURUSD'][Math.floor(Math.random() * 3)],
          type: Math.random() > 0.5 ? 'increase' : 'decrease',
          threshold: 4000 + Math.random() * 100,
          currentPrice: 4000 + Math.random() * 100,
          message: 'Price alert triggered',
          timestamp: new Date()
        }
        setAlerts(prev => [newAlert, ...prev].slice(0, 10))
        setShowNotification(true)
        setTimeout(() => setShowNotification(false), 5000)
      }
    }, 10000)

    setAlerts(mockAlerts)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      {/* Notification Toast */}
      {showNotification && alerts[0] && (
        <div className="fixed top-20 right-6 z-50 glass rounded-xl p-4 border border-cyan-500/30 shadow-lg animate-slideIn">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              alerts[0].type === 'increase' ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              {alerts[0].type === 'increase' ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div>
              <div className="font-bold text-sm">Price Alert</div>
              <div className="text-xs text-slate-400">{alerts[0].message}</div>
              <div className="text-xs text-slate-500 mt-1">{alerts[0].asset}</div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="glass rounded-xl p-6 border border-[#0ea5e9]/10">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold">Price Alerts</h3>
          {alerts.length > 0 && (
            <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>

        <div className="space-y-2">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No price alerts yet. Monitoring markets...
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border transition-all ${
                  alert.type === 'increase'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {alert.type === 'increase' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{alert.asset}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {alert.message}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      ${alert.currentPrice.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {alert.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
