import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight, BadgeCheck, MessageCircle } from 'lucide-react'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { QuoteAssistant } from '@/components/assistant/quote-assistant'
import { Contact } from '@/components/site/contact'
import { Faq } from '@/components/site/faq'
import { Process } from '@/components/site/process'
import { QuoteChatButton } from '@/components/site/quote-chat-button'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import {
  jsonLdScript,
  ORGANIZATION_ID,
  professionalService,
} from '@/components/site/structured-data'
import { TrackedLink } from '@/components/ui/tracked'
import { COMPANY_NAME } from '@/content/site'
import type { LandingTopic } from '@/content/site'
import { homeAnchor } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { absoluteUrl, languageAlternates } from '@/lib/urls'

/**
 * Standalone landing page for one ad group (certified, legal, technical, or
 * medical translation): its own keyword H1 and metadata, with the shared
 * process, FAQ, and contact sections underneath.
 */

export interface LandingPageProps {
  params: Promise<{ locale: string }>
}

export async function landingMetadata(
  topic: LandingTopic,
  { params }: LandingPageProps,
): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const t = await getTranslations({ locale, namespace: `landing.${topic.id}` })
  const title = t('metaTitle', { companyName: COMPANY_NAME })
  const description = t('metaDescription')

  return {
    title,
    description,
    openGraph: { title, description, siteName: COMPANY_NAME, type: 'website' },
    twitter: { card: 'summary', title, description },
    alternates: {
      canonical: absoluteUrl(locale, topic.pathname),
      languages: languageAlternates(topic.pathname),
    },
  }
}

export async function LandingPage({ topic, params }: { topic: LandingTopic } & LandingPageProps) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations(`landing.${topic.id}`)
  const tLanding = await getTranslations('landing')
  const tServices = await getTranslations('services')
  const tContact = await getTranslations('contact')
  const documents = tServices.raw(`items.${topic.id}.documents`) as string[]
  const Icon = topic.icon

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      await professionalService(locale),
      {
        '@type': 'Service',
        name: tServices(`items.${topic.id}.title`),
        description: t('metaDescription'),
        url: absoluteUrl(locale, topic.pathname),
        provider: { '@id': ORGANIZATION_ID },
      },
    ],
  }

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="relative overflow-hidden bg-surface">
          <div
            aria-hidden="true"
            className="absolute -right-40 -top-40 size-[480px] rounded-full bg-primary-soft opacity-60 blur-3xl"
          />
          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
            <span
              aria-hidden="true"
              className="flex size-12 items-center justify-center rounded-lg bg-primary-soft text-primary ring-1 ring-primary/10"
            >
              <Icon className="size-6" />
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-balance text-foreground sm:text-5xl">
              {t('headline')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-foreground-secondary">
              {t('intro')}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <QuoteChatButton variant="primary" location={`landing_${topic.id}`}>
                <MessageCircle aria-hidden="true" className="size-4" />
                {tContact('cta')}
              </QuoteChatButton>
              <TrackedLink
                href={homeAnchor(locale, '#services')}
                event="landing_all_services_click"
                eventParams={{ topic: topic.id, link_id: 'all-services', section: 'services' }}
                className="inline-flex min-h-11 items-center gap-1 rounded-md text-sm font-semibold text-primary transition-colors duration-150 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {tLanding('backToServices')}
                <ArrowRight aria-hidden="true" className="size-4" />
              </TrackedLink>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-foreground-secondary">
              <BadgeCheck aria-hidden="true" className="size-4 shrink-0 text-primary" />
              {tContact('ctaNote')}
            </p>
          </div>
        </section>

        <section className="bg-background py-16 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-3 lg:gap-12 lg:px-8">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                {tServices('whatWeTranslate')}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {documents.map((document) => (
                  <li
                    key={document}
                    className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-foreground-secondary"
                  >
                    {document}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                {tServices('whoRequests')}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-foreground-secondary">
                {tServices(`items.${topic.id}.customers`)}
              </p>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                {tServices('whySpecialistsMatter')}
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-foreground-secondary">
                {tServices(`items.${topic.id}.whySpecialists`)}
              </p>
            </div>
          </div>
        </section>

        <Process />
        <Faq items={topic.faqs} />
        <Contact />
      </main>
      <SiteFooter />
      <QuoteAssistant />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(structuredData)} />
    </>
  )
}
