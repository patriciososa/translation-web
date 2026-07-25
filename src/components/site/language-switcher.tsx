'use client'

import { Globe } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { trackEvent } from '@/lib/analytics'
import { LOCALE_LABELS, routing } from '@/i18n/routing'

/**
 * Switches the site locale in place, keeping the current page.
 *
 * Anchors rather than the `<select>` this used to be. A select that navigates
 * on change exposes no href, so Googlebot — which fires no change events — had
 * no way to reach /es, /fr or /de and left them unindexed; it is also hostile
 * to keyboard users, who trip through every option on the way past. The hrefs
 * point at the current page in the other locale, so the landing pages link to
 * their own translations rather than everything funnelling to the home page.
 *
 * Codes, not the native names in the dropdown before: four full labels do not
 * fit the header row. The name stays as the accessible name of each link.
 *
 * The English entry points at /en, which 307s to the unprefixed URL, and that
 * hop is deliberate — do not "fix" it to a bare href. localePrefix is
 * 'as-needed' but locale detection is on, so a plain / from a page in another
 * locale is redirected straight back by the NEXT_LOCALE cookie; the prefix is
 * how the middleware is told the switch was asked for and resets the cookie.
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations('header')
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <nav
      aria-label={t('languageSwitcher')}
      className={`flex items-center gap-0.5 text-sm font-medium ${className}`}
    >
      <Globe aria-hidden="true" className="mr-1 size-4 shrink-0 text-foreground-secondary" />
      {routing.locales.map((code) => {
        const isCurrent = code === locale
        return (
          <Link
            key={code}
            href={pathname}
            locale={code}
            hrefLang={code}
            aria-current={isCurrent ? 'true' : undefined}
            onClick={() =>
              trackEvent('language_change', { from_locale: locale, to_locale: code, link_id: 'language-switcher', section: 'header' })
            }
            className={`rounded-md px-1.5 py-1 uppercase transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isCurrent
                ? 'bg-surface-secondary text-foreground'
                : 'text-foreground-secondary hover:text-foreground'
            }`}
          >
            <span className="sr-only">{LOCALE_LABELS[code]}</span>
            <span aria-hidden="true">{code}</span>
          </Link>
        )
      })}
    </nav>
  )
}
