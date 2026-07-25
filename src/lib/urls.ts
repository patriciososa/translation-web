import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'

export const BASE_URL = 'https://translations.bluelab.ar'

type Href = Parameters<typeof getPathname>[0]['href']

/** Absolute, locale-prefixed URL of a route (with localized slugs applied). */
export function absoluteUrl(locale: Locale, href: Href): string {
  return `${BASE_URL}${getPathname({ locale, href })}`
}

/** hreflang alternates for a route; the unprefixed default locale doubles as x-default. */
export function languageAlternates(href: Href): Record<string, string> {
  return {
    ...Object.fromEntries(routing.locales.map((locale) => [locale, absoluteUrl(locale, href)])),
    'x-default': absoluteUrl(routing.defaultLocale, href),
  }
}
