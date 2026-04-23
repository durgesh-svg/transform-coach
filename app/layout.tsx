import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Transform Coach',
  description: '90-Day Personal Transformation — Durgesh',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-neutral-100 antialiased">
        <main className="min-h-screen max-w-lg mx-auto pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
