// TradeLens AI - TypeScript Type Definitions

export type AssetCategory = 'commodity' | 'fx' | 'crypto' | 'bond' | 'index'

export type BiasDirection = 'BULLISH' | 'BEARISH' | 'NEUTRAL'

export type BiasStrength = 'STRONG' | 'MODERATE' | 'WEAK'

export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW'

export type SessionName = 'Asia' | 'London' | 'New York'

export interface Asset {
  symbol: string
  name: string
  price: number
  change: number
  changePct: number
  category: AssetCategory
  icon?: string
  timestamp?: string
}

export interface NewsItem {
  id: string
  headline: string
  source: string
  time: string
  impact: ImpactLevel
  impactScore: number
  assets: string[]
  direction: BiasDirection
  confidence: number
  category: string
  region: string
  summary: string
}

export interface AssetBias {
  asset: string
  name: string
  bias: BiasDirection
  strength: BiasStrength
  score: number
  confidence: number
  reasoning: string[]
  keyLevel: number
  target: number
  stop: number
  timeframe: string
  updatedAt: string
}

export interface TradingSession {
  name: SessionName
  isActive: boolean
  opensIn?: string
  closesIn?: string
  cities: string[]
  color: string
  volatility?: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface CorrelationData {
  asset1: string
  asset2: string
  correlation: number  // -1 to 1
  period: string
  strength: 'STRONG' | 'MODERATE' | 'WEAK'
  direction: 'POSITIVE' | 'NEGATIVE'
}

export interface GlobeMarker {
  id: string
  lat: number
  lng: number
  city: string
  type: 'financial' | 'central_bank' | 'gold' | 'news' | 'event'
  label: string
  impact?: ImpactLevel
  headline?: string
}

export interface AIStatusMetrics {
  isOnline: boolean
  sourcesScanned: number
  newsProcessed: number
  assetsMonitored: number
  activeAlerts: number
  confidence: number
  lastUpdated: string
}

export interface MarketCondition {
  overall: 'RISK-ON' | 'RISK-OFF' | 'NEUTRAL'
  condition: 'TRENDING' | 'RANGING' | 'VOLATILE' | 'QUIET'
  dominantTheme: string
}
