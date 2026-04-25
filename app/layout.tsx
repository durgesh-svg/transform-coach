import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import SwRegister from '@/components/SwRegister'

export const metadata: Metadata = {
  title: 'Transform Coach',
  description: '90-Day Personal Transformation — Durgesh',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Transform',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f7f4f0] text-stone-900 antialiased">
        <main className="min-h-screen max-w-lg mx-auto pb-20">
          {children}
        </main>
        <BottomNav />
        <SwRegister />
      </body>
    </html>
  )
}
