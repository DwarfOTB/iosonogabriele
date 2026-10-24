import type { Metadata, Viewport } from 'next'
import { Archivo, Fraunces } from 'next/font/google'
import { Mondo } from '@/features/mondo/Mondo'
import './globals.css'

// Archivo con l'asse di larghezza: le scritte vivono compresse al minimo (wdth 62)
const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

// Fraunces con gli assi SOFT e WONK: lettere morbide, imbottite, un po' storte
const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F5F3EE',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://iosonogabriele.it'),
  title: { default: 'iosonogabriele', template: '%s · iosonogabriele' },
  description: 'SONO IO. — il nuovo singolo di iosonogabriele.',
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: 'https://iosonogabriele.it',
    siteName: 'iosonogabriele',
    images: [{ url: '/sono-io/cover.jpg', width: 921, height: 918 }],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${archivo.variable} ${fraunces.variable}`}>
      <body>
        <Mondo />
        {children}
      </body>
    </html>
  )
}
