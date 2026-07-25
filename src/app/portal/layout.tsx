import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

/**
 * Root layout of the translation status portal — deliberately its own, not
 * under [locale]. The site layout loads Google Analytics, which would record
 * the page URL while it still carries the `#token=` link secret; here no
 * third-party script runs at all. The portal is private: never indexed, never
 * sends a Referer, and picks its language from the link (see PortalApp).
 */
export const metadata: Metadata = {
  title: 'Bluelab Translations',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: 'no-referrer',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ecf0f7' },
    { media: '(prefers-color-scheme: dark)', color: '#04060c' },
  ],
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    // The language is only known once the link is verified; PortalApp sets it.
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
