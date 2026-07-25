import type { MetadataRoute } from 'next'

import { LANDING_TOPICS } from '@/content/site'
import { routing } from '@/i18n/routing'
import { absoluteUrl, languageAlternates } from '@/lib/urls'

/** Static routes published for every locale ('/' is the home page). */
const ROUTES = [
  '/',
  ...LANDING_TOPICS.map((topic) => topic.pathname),
  '/work-with-us',
  '/privacy',
  '/terms',
] as const

function priority(route: (typeof ROUTES)[number]): number {
  if (route === '/') return 1
  if (route === '/privacy' || route === '/terms') return 0.5
  // Recruitment, not revenue: worth indexing, below the commercial pages.
  if (route === '/work-with-us') return 0.6
  return 0.8
}

/**
 * Every route in every locale: 8 routes x 4 locales, not 8 English URLs.
 *
 * The alternates are an annotation on an entry, never a submission of the URLs
 * inside them, so listing only the default locale left /es, /fr and /de absent
 * from the sitemap — and with the switcher offering no anchors either, Google
 * had no crawlable path to them at all. Each entry carries the full alternate
 * set including itself, which is what the hreflang sitemap format expects.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return ROUTES.flatMap((route) => {
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
