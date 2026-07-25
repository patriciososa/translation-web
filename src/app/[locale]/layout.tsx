import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { COMPANY_NAME } from '@/content/site'
import { TrackedAnchor } from '@/components/ui/tracked'
import { BASE_URL } from '@/lib/urls'
import { routing } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import '../globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

// Google Analytics loads only when a measurement id is configured, so
// development and preview builds never send traffic.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// es is es_AR, not es_ES: the paid campaigns target Argentina.
const OG_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_AR',
  fr: 'fr_FR',
  de: 'de_DE',
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: Pick<LocaleLayoutProps, 'params'>): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const t = await getTranslations({ locale, namespace: 'metadata' })
  const title = t('title', { companyName: COMPANY_NAME })
  const description = t('description')

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: COMPANY_NAME,
      type: 'website',
      locale: OG_LOCALES[locale],
    },
    twitter: { card: 'summary', title, description },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f8fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0e19' },
  ],
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations('common')

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <NextIntlClientProvider>
          <TrackedAnchor
            href="#main"
            event="skip_to_content_click"
            eventParams={{ link_id: 'skip-to-content', section: 'header' }}
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary focus:shadow-raised"
          >
            {t('skipToContent')}
          </TrackedAnchor>
          {children}
        </NextIntlClientProvider>
      </body>
      {GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
    </html>
  )
}
