import Image from 'next/image'
import { Instagram, MapPin } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import {
  COMPANY_NAME,
  COMPANY_TAGLINE,
  FEATURED_INDUSTRIES,
  INDUSTRIES,
  NAV_LINKS,
  SERVICE_LANGUAGES,
  SERVICES,
  SOCIAL,
} from '@/content/site'
import { TrackedAnchor, TrackedLink, TrackedLocaleLink } from '@/components/ui/tracked'
import { homeAnchor } from '@/i18n/navigation'
import { LOCALE_LABELS, routing } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'

const FOOTER_LINK_CLASSES =
  'text-sm text-navy-muted transition-colors duration-150 hover:text-on-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-navy'

export function SiteFooter() {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const industries = [...FEATURED_INDUSTRIES, ...INDUSTRIES].slice(0, 6)

  return (
    <footer className="bg-navy-ink text-on-navy">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-lg bg-white shadow-button"
              >
                <Image src="/brand-logo.png" alt="" width={28} height={28} className="size-7" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-bold tracking-tight">{COMPANY_NAME}</span>
                <span className="mt-1 text-[13px] font-medium uppercase tracking-[0.14em] text-navy-muted">
                  {COMPANY_TAGLINE}
                </span>
              </span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-muted">
              {t('footer.tagline')}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-navy-muted">
              <MapPin aria-hidden="true" className="size-4 shrink-0" />
              {t('footer.location')}
            </p>
            <p className="mt-5">
              <TrackedAnchor
                href={SOCIAL.instagram.url}
                target="_blank"
                rel="me noopener noreferrer"
                event="social_link_click"
                eventParams={{ location: 'footer', section: 'social', link_id: 'instagram' }}
                aria-label={`${t('footer.followUs')} — Instagram ${SOCIAL.instagram.handle}`}
                className="inline-flex items-center gap-2 rounded-md text-sm text-navy-muted transition-colors duration-150 hover:text-on-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-navy"
              >
                {/* rel="me" is the other half of the JSON-LD sameAs: it lets a
                    crawler confirm the identity from this side too. */}
                <Instagram aria-hidden="true" className="size-4 shrink-0" />
                {SOCIAL.instagram.handle}
              </TrackedAnchor>
            </p>
            {/* The visible "operated by <owner>" line used to sit here, for Google Ads advertiser
                verification. Removed on request; the same attribution still reaches a reviewer
                machine-readably as `founder` in the ProfessionalService JSON-LD
                (structured-data.tsx), which is the only copy left — if Ads ever asks for it on the
                page, this is the spot. */}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FooterColumn title={t('footer.navigation')}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <TrackedLink
                    href={homeAnchor(locale, link.href)}
                    event="nav_link_click"
                    eventParams={{ location: 'footer', link_id: link.id, section: 'navigation' }}
                    className={FOOTER_LINK_CLASSES}
                  >
                    {t(`header.nav.${link.id}`)}
                  </TrackedLink>
                </li>
              ))}
            </FooterColumn>
            <FooterColumn title={t('footer.services')}>
              {SERVICES.map((service) => (
                <li key={service.id}>
                  <TrackedLink
                    href={homeAnchor(locale, '#services')}
                    event="footer_link_click"
                    eventParams={{ location: 'footer', section: 'services', link_id: service.id, service_id: service.id }}
                    className={FOOTER_LINK_CLASSES}
                  >
                    {t(`services.items.${service.id}.title`)}
                  </TrackedLink>
                </li>
              ))}
            </FooterColumn>
            <FooterColumn title={t('footer.industries')}>
              {industries.map((industry) => (
                <li key={industry.id}>
                  <TrackedLink
                    href={homeAnchor(locale, '#industries')}
                    event="footer_link_click"
                    eventParams={{ location: 'footer', section: 'industries', link_id: industry.id }}
                    className={FOOTER_LINK_CLASSES}
                  >
                    {t(`industries.items.${industry.id}.name`)}
                  </TrackedLink>
                </li>
              ))}
            </FooterColumn>
            {/* One entry per language, not per pair: seven languages make
                twenty-one pairs, and a column that long dwarfs the three
                beside it. The section itself still lists every combination. */}
            <FooterColumn title={t('footer.languages')}>
              {SERVICE_LANGUAGES.map((code) => (
                <li key={code}>
                  <TrackedLink
                    href={homeAnchor(locale, '#languages')}
                    event="footer_link_click"
                    eventParams={{ location: 'footer', section: 'languages', link_id: code }}
                    className={FOOTER_LINK_CLASSES}
                  >
                    {t(`languages.names.${code}`)}
                  </TrackedLink>
                </li>
              ))}
            </FooterColumn>
          </div>
        </div>

        {/* The other half of the header switcher, which is hidden below lg and,
            on a phone, only exists once the menu is open. This row is what a
            phone visitor and a crawler reach from any page, so it spells the
            languages out natively instead of using the header's codes. It
            points at each home page: a server component has no pathname to
            translate, and the header handles staying put. */}
        <nav
          aria-label={t('header.languageSwitcher')}
          className="mt-14 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-6"
        >
          <h3 className="text-xs font-semibold uppercase tracking-widest text-on-navy/80">
            {t('header.languageSwitcher')}
          </h3>
          {routing.locales.map((code) => (
            <TrackedLocaleLink
              key={code}
              href="/"
              locale={code}
              hrefLang={code}
              aria-current={code === locale ? 'true' : undefined}
              event="language_change"
              eventParams={{ from_locale: locale, to_locale: code, link_id: 'footer-language', section: 'footer' }}
              className={code === locale ? `${FOOTER_LINK_CLASSES} text-on-navy` : FOOTER_LINK_CLASSES}
            >
              {LOCALE_LABELS[code]}
            </TrackedLocaleLink>
          ))}
        </nav>

        <div className="mt-6 flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-navy-muted">
            {t('common.copyright', {
              year: String(new Date().getFullYear()),
              companyName: COMPANY_NAME,
            })}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <TrackedLocaleLink
                href="/work-with-us"
                event="footer_link_click"
                eventParams={{ location: 'footer', section: 'careers', link_id: 'work-with-us' }}
                className={FOOTER_LINK_CLASSES}
              >
                {t('footer.careers')}
              </TrackedLocaleLink>
            </li>
            <li>
              <TrackedLocaleLink
                href="/privacy"
                event="footer_link_click"
                eventParams={{ location: 'footer', section: 'legal', link_id: 'privacy' }}
                className={FOOTER_LINK_CLASSES}
              >
                {t('footer.privacy')}
              </TrackedLocaleLink>
            </li>
            <li>
              <TrackedLocaleLink
                href="/terms"
                event="footer_link_click"
                eventParams={{ location: 'footer', section: 'legal', link_id: 'terms' }}
                className={FOOTER_LINK_CLASSES}
              >
                {t('footer.terms')}
              </TrackedLocaleLink>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-on-navy/80">{title}</h3>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </nav>
  )
}
