import type { MetadataRoute } from 'next'

import { LANDING_TOPICS } from '@/content/site'
import { routing } from '@/i18n/routing'
import { absoluteUrl, languageAlternates } from '@/lib/urls'

/** Static routes published for every locale ('/' is the home page). */
const ROUTES = [
  '/',
  ...LANDING_TOPICS.map((topic) => topic.pathname),
  '/work-with-us',
] as const

/**
 * When each route's content last really changed, for <lastmod>.
 *
 * Bump a route's date when you deploy a change people would see on that page
 * (its copy in messages/*.json, its page.tsx, or a component it renders) —
 * not on every deploy. A build-time `new Date()` stamped every URL as changed
 * on every build, which teaches Google to ignore lastmod altogether.
 *
 * Seeded 2026-11-01 from the mtimes on the server (the repo has no history):
 * the latest copy change was messages/*.json and content/site.ts on
 * 2026-10-26, shared by every page, so they all start there.
 */
const LAST_MODIFIED: Record<(typeof ROUTES)[number], string> = {
  '/': '2026-10-26',
  '/certified-translation': '2026-10-26',
  '/legal-translation': '2026-10-26',
  '/technical-translation': '2026-10-26',
  '/medical-translation': '2026-10-26',
  '/transcription-subtitling': '2026-10-26',
  '/work-with-us': '2026-10-26',
}

function priority(route: (typeof ROUTES)[number]): number {
  if (route === '/') return 1
  // Recruitment, not revenue: worth indexing, below the commercial pages.
  if (route === '/work-with-us') return 0.6
  return 0.8
}

/**
 * Every route in every locale: 7 routes x 3 locales, not 7 English URLs.
 *
 * The alternates are an annotation on an entry, never a submission of the URLs
 * inside them, so listing only the default locale left /es and /fr absent
 * from the sitemap — and with the switcher offering no anchors either, Google
 * had no crawlable path to them at all. Each entry carries the full alternate
 * set including itself, which is what the hreflang sitemap format expects.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.flatMap((route) => {
    const lastModified = LAST_MODIFIED[route]
    const languages = languageAlternates(route)
    const changeFrequency = route === '/' ? 'weekly' : 'yearly'

    return routing.locales.map((locale) => ({
      url: absoluteUrl(locale, route),
      lastModified,
      changeFrequency,
      priority: priority(route),
      alternates: { languages },
    }))
  })
}
