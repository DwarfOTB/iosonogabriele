import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0d0905',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://iosonogabriele.it'),
  title: { default: 'iosonogabriele', template: '%s — iosonogabriele' },
  description: 'Il Sole è Rosso — album e tour estivo 2025. Entra nel mondo 3D di iosonogabriele.',
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://iosonogabriele.it',
    siteName: 'iosonogabriele',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630 }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
