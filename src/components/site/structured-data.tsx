import { getTranslations } from 'next-intl/server'
import {
  COMPANY_ALTERNATE_NAME,
  COMPANY_NAME,
  COMPANY_OWNER,
  FAQS,
  LANGUAGE_PAIRS,
  SERVICES,
  SOCIAL_PROFILE_URLS,
} from '@/content/site'
import { routing } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import { absoluteUrl, BASE_URL } from '@/lib/urls'

export const ORGANIZATION_ID = `${BASE_URL}/#organization`
export const WEBSITE_ID = `${BASE_URL}/#website`

/**
 * What Google reads to label the result as "Bluelab" rather than "bluelab.ar".
 *
 * It is the top signal for the site name, ahead of og:site_name, and without it
 * a subdomain falls back to the domain-level name — which bluelab.ar cannot
 * supply, since it only 301s here. Google reads this on root-level home pages
 * only, so `url` stays BASE_URL for every locale: /es, /fr and /de are
 * subdirectories and pinning them here would point at pages Google ignores.
 */
const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: COMPANY_NAME,
  alternateName: COMPANY_ALTERNATE_NAME,
  url: `${BASE_URL}/`,
  publisher: { '@id': ORGANIZATION_ID },
}

/** Escape < so any markup in translated copy stays inert inside the script tag. */
export function jsonLdScript(data: object): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') }
}

/** The business entity, shared by every page's structured data via @id. */
export async function professionalService(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    '@type': 'ProfessionalService',
    '@id': ORGANIZATION_ID,
    name: COMPANY_NAME,
    // "Bluelab" is the official name; the trade name is only an alias, and the
    // founder ties the brand to the verified Google Ads advertiser.
    alternateName: COMPANY_ALTERNATE_NAME,
    founder: { '@type': 'Person', name: COMPANY_OWNER },
    description: t('description'),
    url: absoluteUrl(locale, '/'),
    // How a crawler learns the Instagram account and this site are the same
    // business. Only profiles the company actually controls belong here.
    sameAs: SOCIAL_PROFILE_URLS,
    areaServed: 'Worldwide',
    // The languages we can actually deal with a customer IN, which is
    // routing.locales — not SERVICE_LANGUAGES. Tempting to widen every time a
    // service language is added (Italian, then Portuguese and Chinese), but
    // this claims the chat and the support can answer in them, and they cannot.
    availableLanguage: [...routing.locales],
    priceRange: '$$',
  }
}

/**
 * Spanish swaps "y" for "e" before a word starting with an i- sound, so the
 * pair reads "español e inglés" and "francés e italiano". The other three
 * locales use one connector throughout.
 */
function connector(join: string, locale: string, next: string) {
  return locale === 'es' && /^i/i.test(next) ? 'e' : join
}

/**
 * The twenty-one language pairs, as an OfferCatalog.
 *
 * These used to be a visible list under the language chips. As copy they were
 * a wall of text, but the phrasing ("inglés y español") is exactly what the ads
 * bid on, so they live here instead: still crawlable, costing no page height.
 */
async function languagePairCatalog(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'languages' })
  const join = t('join')

  return {
    '@type': 'OfferCatalog',
    name: t('title'),
    itemListElement: LANGUAGE_PAIRS.map((pair) => {
      const a = t(`names.${pair.a}`)
      const b = t(`names.${pair.b}`)
      return {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: t('pairService', { pair: `${a} ${connector(join, locale, b)} ${b}` }),
          provider: { '@id': ORGANIZATION_ID },
        },
      }
    }),
  }
}

/**
 * Home-page structured data: the site itself, the business, every FAQ entry,
 * one Service node per service card, and the language-pair catalog, for rich
 * results on the queries the ads target.
 */
export async function StructuredData({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale })

  const graph = [
    website,
    await professionalService(locale),
    await languagePairCatalog(locale),
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: t(`faq.items.${faq}.question`),
        acceptedAnswer: { '@type': 'Answer', text: t(`faq.items.${faq}.answer`) },
      })),
    },
    ...SERVICES.map((service) => ({
      '@type': 'Service',
      name: t(`services.items.${service.id}.title`),
      description: t(`services.items.${service.id}.description`),
      provider: { '@id': ORGANIZATION_ID },
    })),
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={jsonLdScript({ '@context': 'https://schema.org', '@graph': graph })}
    />
  )
}
