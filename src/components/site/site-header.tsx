'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { COMPANY_NAME, COMPANY_TAGLINE, NAV_LINKS } from '@/content/site'
import { homeAnchor } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { trackEvent } from '@/lib/analytics'
import { LanguageSwitcher } from './language-switcher'

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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link
            href={homeAnchor(locale, '#top')}
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

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={homeAnchor(locale, link.href)}
                onClick={() => trackEvent('nav_link_click', { location: 'header', link_id: link.id, href: link.href, section: 'header' })}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground-secondary transition-colors duration-150 hover:bg-surface-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {t(`nav.${link.id}`)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher className="hidden lg:flex" />
            <button
              type="button"
              onClick={() => {
                trackEvent('mobile_menu_toggle', { action: menuOpen ? 'close' : 'open', link_id: 'mobile-menu', section: 'header' })
                setMenuOpen((open) => !open)
              }}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              className="flex size-11 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors duration-150 hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-primary lg:hidden"
            >
              {menuOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="animate-menu-in border-t border-border bg-surface px-4 pb-6 pt-2 shadow-raised lg:hidden"
          >
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={homeAnchor(locale, link.href)}
                    onClick={() => {
                      trackEvent('nav_link_click', { location: 'header_mobile', link_id: link.id, href: link.href, section: 'header' })
                      closeMenu()
                    }}
                    className="block rounded-md px-2 py-3 text-base font-medium text-foreground transition-colors duration-150 hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {t(`nav.${link.id}`)}
                  </Link>
                </li>
              ))}
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
