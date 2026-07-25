'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { COMPANY_NAME, COMPANY_TAGLINE, NAV_LINKS } from '@/content/site'
import { Link as LocaleLink, homeAnchor } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { trackEvent } from '@/lib/analytics'
import { LanguageSwitcher } from './language-switcher'

const DESKTOP_LINK_CLASSES =
  'rounded-md px-2.5 py-2 text-sm font-medium text-foreground-secondary transition-colors duration-150 hover:bg-surface-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

const MOBILE_LINK_CLASSES =
  'block rounded-md px-2 py-3 text-base font-medium text-foreground transition-colors duration-150 hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-primary'

/** Sticky site header; gains a border and shadow once the page is scrolled. */
export function SiteHeader() {
  const t = useTranslations('header')
  const locale = useLocale() as Locale
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (sentinel === null) return
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting))
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* Marker at the very top of the page; when it scrolls away, elevate the header. */}
      <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute top-0 h-6 w-px" />
      <header
        className={`sticky top-0 z-40 border-b bg-surface/90 backdrop-blur-md transition-shadow duration-200 ${
          scrolled ? 'border-border shadow-soft' : 'border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href={homeAnchor(locale, 'top')}
            onClick={() => trackEvent('logo_click', { location: 'header', link_id: 'logo', section: 'header' })}
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-lg bg-white shadow-button"
            >
              <Image src="/brand-logo.png" alt="" width={28} height={28} className="size-7" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                {COMPANY_NAME}
              </span>
              <span className="mt-1 text-[13px] font-medium uppercase tracking-[0.14em] text-muted">
                {COMPANY_TAGLINE}
              </span>
            </span>
          </Link>

          {/* xl, not lg: the bar is sized by its longest translation. At lg
              (1024px) the Spanish nav plus the switcher scrolls the page
              sideways, and its labels ("Cómo trabajamos", "Preguntas
              frecuentes") keep wrapping to two lines. Re-measured after German
              left and the switcher went from four codes to three (2026-08-25):
              the Spanish bar is clean from 1208px, English from 1200 and French
              from 1100 — better than the 1280 it needed before, but still past
              lg, so xl stands. Below it every locale gets the menu button.
              The careers link added 2026-10-12 is 165px of Spanish. It fits
              at xl because "Inicio" left the navigation to make room, the
              link padding went from px-3 to px-2.5 and the gaps were
              tightened; measure the Spanish bar at 1280 before adding an item
              or lengthening a label. */}
          {/* GA reports the canonical anchor ('#services'), not the localized
              href the visitor followed, so one nav link is one row in the
              report rather than four. */}
          <nav aria-label="Primary" className="hidden items-center xl:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.id}
                href={homeAnchor(locale, link.section)}
                onClick={() => trackEvent('nav_link_click', { location: 'header', link_id: link.id, href: `#${link.section}`, section: 'header' })}
                className={DESKTOP_LINK_CLASSES}
              >
                {t(`nav.${link.id}`)}
              </Link>
            ))}
            {/* A page, not a home-page section, so it is not in NAV_LINKS; it
                sits in the same row with the same classes so it reads as one
                more nav item rather than as the footer afterthought it was. */}
            <LocaleLink
              href="/work-with-us"
              onClick={() => trackEvent('nav_link_click', { location: 'header', link_id: 'work-with-us', href: '/work-with-us', section: 'header' })}
              className={DESKTOP_LINK_CLASSES}
            >
              {t('nav.careers')}
            </LocaleLink>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher className="hidden xl:flex" />
            <button
              type="button"
              onClick={() => {
                trackEvent('mobile_menu_toggle', { action: menuOpen ? 'close' : 'open', link_id: 'mobile-menu', section: 'header' })
                setMenuOpen((open) => !open)
              }}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              className="flex size-11 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors duration-150 hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-primary xl:hidden"
            >
              {menuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="animate-menu-in border-t border-border bg-surface px-4 pb-6 pt-2 shadow-raised xl:hidden"
          >
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <Link
                    href={homeAnchor(locale, link.section)}
                    onClick={() => {
                      trackEvent('nav_link_click', { location: 'header_mobile', link_id: link.id, href: `#${link.section}`, section: 'header' })
                      closeMenu()
                    }}
                    className={MOBILE_LINK_CLASSES}
                  >
                    {t(`nav.${link.id}`)}
                  </Link>
                </li>
              ))}
              <li>
                <LocaleLink
                  href="/work-with-us"
                  onClick={() => {
                    trackEvent('nav_link_click', { location: 'header_mobile', link_id: 'work-with-us', href: '/work-with-us', section: 'header' })
                    closeMenu()
                  }}
                  className={MOBILE_LINK_CLASSES}
                >
                  {t('nav.careers')}
                </LocaleLink>
              </li>
            </ul>
            <div className="mt-2 border-t border-border px-2 pt-3">
              <LanguageSwitcher />
            </div>
          </nav>
        )}
      </header>
    </>
  )
}
