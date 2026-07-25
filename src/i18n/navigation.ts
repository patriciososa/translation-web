import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'
import type { Locale } from './routing'

/** Locale-aware replacements for the next/navigation equivalents. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)

/**
 * Locale-prefixed link to a home-page anchor ('/es#services'). Section links
 * must carry the home path so they still work from the landing pages.
 */
export function homeAnchor(locale: Locale, hash: `#${string}`): string {
  const home = getPathname({ locale, href: '/' })
  return home === '/' ? `/${hash}` : `${home}${hash}`
}
