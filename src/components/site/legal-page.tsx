import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { COMPANY_NAME, COMPANY_TAGLINE, CONTACT } from '@/content/site'
import { TrackedAnchor, TrackedLocaleLink } from '@/components/ui/tracked'
import type { ReactNode } from 'react'

/** Shared shell for the privacy and terms pages: minimal header, prose body, small footer. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  const t = useTranslations()

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <TrackedLocaleLink
            href="/"
            event="logo_click"
            eventParams={{ location: 'legal_header', link_id: 'logo', section: 'header' }}
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
          </TrackedLocaleLink>
          <TrackedLocaleLink
            href="/"
            event="nav_link_click"
            eventParams={{ location: 'legal_header', link_id: 'home', section: 'header' }}
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {t('legal.backToHome')}
          </TrackedLocaleLink>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <div className="mt-8 space-y-8">{children}</div>
      </main>
      <footer className="border-t border-border py-8">
        <p className="mx-auto max-w-3xl px-4 text-sm text-muted sm:px-6">
          {t('common.copyright', {
            year: String(new Date().getFullYear()),
            companyName: COMPANY_NAME,
          })}
        </p>
      </footer>
    </>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-foreground-secondary">
        {children}
      </div>
    </section>
  )
}

/** The closing contact section shared by both legal pages, with a mailto link. */
export function LegalContactSection({ namespace }: { namespace: 'legal.privacy' | 'legal.terms' }) {
  const t = useTranslations()

  return (
    <LegalSection title={t('legal.contactTitle')}>
      <p>
        {t.rich(`${namespace}.contactBody`, {
          email: CONTACT.email,
          link: (chunks) => (
            <TrackedAnchor
              href={`mailto:${CONTACT.email}`}
              event="contact_email_click"
              eventParams={{ location: 'legal', link_id: 'contact-email', section: 'contact' }}
              className="font-medium text-primary underline underline-offset-2"
            >
              {chunks}
            </TrackedAnchor>
          ),
        })}
      </p>
    </LegalSection>
  )
}
