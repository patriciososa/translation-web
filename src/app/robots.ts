import type { MetadataRoute } from 'next'

import { BASE_URL } from '@/lib/urls'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The translation status portal is private (personal links only).
      disallow: ['/api/', '/portal'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
