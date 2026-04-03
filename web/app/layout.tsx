import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Cinzel } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { QueryProvider } from '@/components/query-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: 'resizes-content',
}

export const metadata: Metadata = {
  title: 'TTRPG Character Creator',
  description: 'Create your character with an AI-powered assistant',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <html lang="en">
          <body className="font-sans antialiased">
            {children}
            <Analytics />
          </body>
        </html>
      </QueryProvider>
    </ClerkProvider>
  )
}
