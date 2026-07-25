import { defineRouting } from 'next-intl/routing'

/**
 * The locales the site itself is published in. A subset of what the business
 * translates (see SERVICE_LANGUAGES in content/site.ts): Italian, Portuguese
 * and Chinese are offered as translation services but the site is not
 * published in them, and a new service language must not quietly become a new
 * locale here. English stays unprefixed so existing URLs keep working; other
 * locales live under /es, /fr, and /de.
 */
export const routing = defineRouting({
  locales: ['en', 'es', 'fr', 'de'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  // Localized slugs so each ad group lands on a keyword-matching URL
  // (e.g. /es/traduccion-certificada). Keys are the app-route folder names.
  pathnames: {
    '/': '/',
    '/privacy': '/privacy',
    '/terms': '/terms',
    // Translators applying to work with us, not customers. Localized like the
    // ad landing pages because the searches are in the applicant's language.
    '/work-with-us': {
      en: '/work-with-us',
      es: '/trabaja-con-nosotros',
      fr: '/travailler-avec-nous',
      de: '/mitarbeiten',
    },
    '/certified-translation': {
      en: '/certified-translation',
      es: '/traduccion-certificada',
      fr: '/traduction-certifiee',
      de: '/beglaubigte-uebersetzung',
    },
    '/legal-translation': {
      en: '/legal-translation',
      es: '/traduccion-juridica',
      fr: '/traduction-juridique',
      de: '/juristische-uebersetzung',
    },
    '/technical-translation': {
      en: '/technical-translation',
      es: '/traduccion-tecnica',
      fr: '/traduction-technique',
      de: '/technische-uebersetzung',
    },
    '/medical-translation': {
      en: '/medical-translation',
      es: '/traduccion-medica',
      fr: '/traduction-medicale',
      de: '/medizinische-uebersetzung',
    },
  },
})

export type Locale = (typeof routing.locales)[number]

/** Native-language labels for the language switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
}
