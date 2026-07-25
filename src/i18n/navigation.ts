import { createNavigation } from 'next-intl/navigation'
import { routing, SECTION_ANCHORS } from './routing'
import type { Locale, SectionAnchor } from './routing'

/** Locale-aware replacements for the next/navigation equivalents. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)

/**
 * The id a section carries in this locale — the other half of `homeAnchor`.
 * Rendered as the `<section id>`; never hard-code the string in the markup.
 */
export function sectionId(locale: Locale, section: SectionAnchor): string {
  return SECTION_ANCHORS[section][locale]
}

/**
 * Locale-prefixed link to a home-page section ('/#servicios', '/en#services').
 * Section links must carry the home path so they still work from the landing
 * pages, and the fragment is localized with it.
 */
export function homeAnchor(locale: Locale, section: SectionAnchor): string {
  const home = getPathname({ locale, href: '/' })
  const hash = `#${sectionId(locale, section)}`
  return home === '/' ? `/${hash}` : `${home}${hash}`
}
