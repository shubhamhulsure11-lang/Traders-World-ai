// TradeLens AI - Core Constants

export const ASSETS = [
  { symbol: 'XAUUSD', name: 'Gold', category: 'commodity', color: '#F59E0B' },
  { symbol: 'EURUSD', name: 'Euro/USD', category: 'fx', color: '#3B82F6' },
  { symbol: 'BTC', name: 'Bitcoin', category: 'crypto', color: '#F97316' },
  { symbol: 'ETH', name: 'Ethereum', category: 'crypto', color: '#8B5CF6' },
]

export const SESSIONS = [
  {
    name: 'Asia',
    timezone: 'Asia/Tokyo',
    open: 0,   // UTC hour
    close: 9,  // UTC hour
    color: '#22D3EE',
    cities: ['Tokyo', 'Sydney', 'Singapore', 'Hong Kong'],
  },
  {
    name: 'London',
    timezone: 'Europe/London',
    open: 8,
    close: 17,
    color: '#A78BFA',
    cities: ['London', 'Frankfurt', 'Paris', 'Zurich'],
  },
  {
    name: 'New York',
    timezone: 'America/New_York',
    open: 13,
    close: 22,
    color: '#34D399',
    cities: ['New York', 'Chicago', 'Toronto'],
  },
]

export const GLOBE_MARKERS = [
  // Major Financial Centers
  { id: 'ny', lat: 40.7128, lng: -74.006, city: 'New York', type: 'financial', label: 'NYSE / NASDAQ' },
  { id: 'london', lat: 51.5074, lng: -0.1278, city: 'London', type: 'financial', label: 'LSE / FOREX Hub' },
  { id: 'tokyo', lat: 35.6762, lng: 139.6503, city: 'Tokyo', type: 'financial', label: 'TSE / JPY' },
  { id: 'frankfurt', lat: 50.1109, lng: 8.6821, city: 'Frankfurt', type: 'financial', label: 'DAX / ECB' },
  { id: 'hk', lat: 22.3193, lng: 114.1694, city: 'Hong Kong', type: 'financial', label: 'HKEX' },
  { id: 'singapore', lat: 1.3521, lng: 103.8198, city: 'Singapore', type: 'financial', label: 'SGX' },
  { id: 'dubai', lat: 25.2048, lng: 55.2708, city: 'Dubai', type: 'financial', label: 'DIFC / Gold Hub' },
  { id: 'zurich', lat: 47.3769, lng: 8.5417, city: 'Zurich', type: 'financial', label: 'SNB / Gold Vaults' },
  // Central Banks
  { id: 'fed', lat: 38.8951, lng: -77.0364, city: 'Washington DC', type: 'central_bank', label: 'Federal Reserve' },
  { id: 'boe', lat: 51.5155, lng: -0.0887, city: 'London', type: 'central_bank', label: 'Bank of England' },
  { id: 'ecb', lat: 50.1109, lng: 8.7172, city: 'Frankfurt', type: 'central_bank', label: 'European Central Bank' },
  { id: 'pboc', lat: 39.9042, lng: 116.4074, city: 'Beijing', type: 'central_bank', label: 'People\'s Bank of China' },
  // Gold Markets
  { id: 'gold_london', lat: 51.5074, lng: -0.1278, city: 'London', type: 'gold', label: 'LBMA Gold Fix' },
  { id: 'gold_comex', lat: 40.7128, lng: -74.006, city: 'New York', type: 'gold', label: 'COMEX Gold Futures' },
  { id: 'gold_shanghai', lat: 31.2304, lng: 121.4737, city: 'Shanghai', type: 'gold', label: 'SGE Gold Exchange' },
]

export const IMPACT_COLORS = {
  HIGH: '#EF4444',
  MEDIUM: '#F59E0B',
  LOW: '#22C55E',
}

export const BIAS_COLORS = {
  BULLISH: '#22C55E',
  BEARISH: '#EF4444',
  NEUTRAL: '#6B7280',
}

export const APP_NAME = 'TradeLens AI'
export const APP_TAGLINE = 'AI Market Intelligence Operating System'
export const APP_AUTHOR = 'Shubham Hulsure'
