import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { QuoteAssistant } from '@/components/assistant/quote-assistant'
import { AiEmpowerment } from '@/components/site/ai-empowerment'
import { Contact } from '@/components/site/contact'
import { Faq } from '@/components/site/faq'
import { Hero } from '@/components/site/hero'
import { Industries } from '@/components/site/industries'
import { LanguagesSection } from '@/components/site/languages'
import { Process } from '@/components/site/process'
import { Services } from '@/components/site/services'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { Stats } from '@/components/site/stats'
import { StructuredData } from '@/components/site/structured-data'
import { WhyChooseUs } from '@/components/site/why-choose-us'
import { routing } from '@/i18n/routing'
import { absoluteUrl, languageAlternates } from '@/lib/urls'

interface HomeProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  return {
    alternates: {
      canonical: absoluteUrl(locale, '/'),
      languages: languageAlternates('/'),
    },
  }
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Services />
        <Industries />
        <LanguagesSection />
        <WhyChooseUs />
        <Process />
        <Stats />
        {/* Kept below the trust-building sections; see the note on AiEmpowerment. */}
        <AiEmpowerment />
        <Faq />
        <Contact />
      </main>
      <SiteFooter />
      <QuoteAssistant />
      <StructuredData locale={locale} />
    </>
  )
}
