import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TradeLens AI — AI Market Intelligence Operating System',
  description: 'AI-powered 24/7 market intelligence terminal for serious traders. Real-time macro, geopolitical & cross-asset analysis. Built by Shubham Hulsure.',
  keywords: 'gold trading, AI market intelligence, XAUUSD, forex analysis, BTC, ETH, trading terminal, market bias',
  authors: [{ name: 'Shubham Hulsure' }],
  openGraph: {
    title: 'TradeLens AI — Market Intelligence Operating System',
    description: 'AI-powered 24/7 market intelligence terminal',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#020408] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}
