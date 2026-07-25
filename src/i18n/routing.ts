import { defineRouting } from 'next-intl/routing'

/**
 * The locales the site itself is published in. A subset of what the business
 * translates (see SERVICE_LANGUAGES in content/site.ts): German, Italian,
 * Portuguese and Chinese are offered as translation services but the site is
 * not published in them, and a new service language must not quietly become a
 * new locale here.
 *
 * Spanish is the primary language of the business and holds the unprefixed
 * URLs (`/`, `/traduccion-certificada`); English and French live under /en and
 * /fr. It was English until 2026-08-10, so /es/* and the bare English slugs
 * (`/certified-translation`) are redirected by the middleware rather than
 * served — do not add the old paths back as routes. German was published under
 * /de until 2026-08-25; those URLs are gone rather than redirected (the owner's
 * call), so /de now 404s and its slugs must not come back here either.
 */
export const routing = defineRouting({
  // Spanish first: the order drives the language switcher and the sitemap.
  locales: ['es', 'en', 'fr'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',
  // Localized slugs so each ad group lands on a keyword-matching URL
  // (e.g. /traduccion-certificada, /en/certified-translation). Keys are the
  // app-route folder names.
  pathnames: {
    '/': '/',
    // Translators applying to work with us, not customers. Localized like the
    // ad landing pages because the searches are in the applicant's language.
    '/work-with-us': {
      en: '/work-with-us',
      es: '/trabaja-con-nosotros',
      fr: '/rejoignez-nous',
    },
    '/certified-translation': {
      en: '/certified-translation',
      es: '/traduccion-certificada',
      fr: '/traduction-certifiee',
    },
    '/legal-translation': {
      en: '/legal-translation',
      es: '/traduccion-legal',
      fr: '/traduction-juridique',
    },
    '/technical-translation': {
      en: '/technical-translation',
      es: '/traduccion-tecnica',
      fr: '/traduction-technique',
    },
    '/medical-translation': {
      en: '/medical-translation',
      es: '/traduccion-medica',
      fr: '/traduction-medicale',
    },
    '/transcription-subtitling': {
      en: '/transcription-subtitling',
      es: '/transcripcion-y-subtitulado',
      fr: '/transcription-sous-titrage',
    },
  },
})

export type Locale = (typeof routing.locales)[number]

/**
 * Home-page section anchors, localized for the same reason the pathnames are:
 * a Spanish visitor's URL should read `/#contacto`, not `/#contact`.
 *
 * A fragment never reaches the server, so next-intl cannot route it — the id
 * rendered on the `<section>` and every href pointing at it are both built
 * from this table, and any drift between them is a link that scrolls nowhere.
 * Add a section here before giving it an id in the markup.
 *
 * The slug is the section's own name in that language (the header.nav.* labels
 * are the source), ASCII-only like the pathnames above — 'ueber-uns', not
 * 'über-uns'. English keeps the slugs it already had, so links shared before
 * this existed still land.
 */
export const SECTION_ANCHORS = {
  top: { es: 'inicio', en: 'top', fr: 'accueil' },
  services: { es: 'servicios', en: 'services', fr: 'services' },
  industries: { es: 'sectores', en: 'industries', fr: 'secteurs' },
  languages: { es: 'idiomas', en: 'languages', fr: 'langues' },
  about: { es: 'nosotros', en: 'about', fr: 'a-propos' },
  process: { es: 'proceso', en: 'process', fr: 'methode' },
  // 'FAQ' is the label in two of the three; only Spanish spells it out.
  faq: { es: 'preguntas-frecuentes', en: 'faq', fr: 'faq' },
  contact: { es: 'contacto', en: 'contact', fr: 'contact' },
} as const satisfies Record<string, Record<Locale, string>>

export type SectionAnchor = keyof typeof SECTION_ANCHORS

/** Native-language labels for the language switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
}
