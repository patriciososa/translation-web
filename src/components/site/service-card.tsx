'use client'

import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Service } from '@/content/site'
import { trackEvent } from '@/lib/analytics'

interface ServiceCardProps {
  /** Icon arrives pre-rendered because component functions cannot cross the server boundary. */
  service: Omit<Service, 'icon'>
  icon: ReactNode
}

/** A service summary that expands in place to reveal the full details. */
export function ServiceCard({ service, icon }: ServiceCardProps) {
  const t = useTranslations('services')
  const [expanded, setExpanded] = useState(false)
  const detailsId = useId()
  const featured = service.featured === true
  const documents = t.raw(`items.${service.id}.documents`) as string[]

  return (
    <article
      className={`flex h-full flex-col rounded-xl border p-6 transition-all duration-300 hover:shadow-raised motion-safe:hover:-translate-y-0.5 sm:p-7 ${
        featured
          ? 'border-white/10 bg-gradient-to-b from-navy to-navy-ink text-on-navy'
          : 'border-border bg-surface shadow-soft hover:border-border-strong'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex size-11 items-center justify-center rounded-lg ${
          featured
            ? 'bg-white/10 text-on-navy ring-1 ring-white/15'
            : 'bg-primary-soft text-primary ring-1 ring-primary/10'
        }`}
      >
        {icon}
      </span>
      <h3 className="mt-4 font-display text-xl font-bold tracking-tight">
        {t(`items.${service.id}.title`)}
      </h3>
      <p className={`mt-2 text-[15px] leading-relaxed ${featured ? 'text-navy-muted' : 'text-foreground-secondary'}`}>
        {t(`items.${service.id}.description`)}
      </p>

      {expanded && (
        <dl
          id={detailsId}
          className={`mt-4 space-y-3 border-t pt-4 text-sm leading-relaxed ${
            featured ? 'border-white/10 text-navy-muted' : 'border-border text-foreground-secondary'
          }`}
        >
          <div>
            <dt className={`font-semibold ${featured ? 'text-on-navy' : 'text-foreground'}`}>
              {t(service.detailsLabel ?? 'whatWeTranslate')}
            </dt>
            <dd className="mt-1">{documents.join(', ')}.</dd>
          </div>
          <div>
            <dt className={`font-semibold ${featured ? 'text-on-navy' : 'text-foreground'}`}>
              {t('whoRequests')}
            </dt>
            <dd className="mt-1">{t(`items.${service.id}.customers`)}</dd>
          </div>
          <div>
            <dt className={`font-semibold ${featured ? 'text-on-navy' : 'text-foreground'}`}>
              {t('whySpecialistsMatter')}
            </dt>
            <dd className="mt-1">{t(`items.${service.id}.whySpecialists`)}</dd>
          </div>
        </dl>
      )}

      <button
        type="button"
        onClick={() => {
          trackEvent('service_card_toggle', {
            service_id: service.id,
            action: expanded ? 'collapse' : 'expand',
            link_id: `service-${service.id}`,
            section: 'services',
          })
          setExpanded((value) => !value)
        }}
        aria-expanded={expanded}
        aria-controls={detailsId}
        className={`mt-4 inline-flex min-h-11 cursor-pointer items-center gap-1 self-start rounded-md text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 ${
          featured
            ? 'text-navy-muted hover:text-on-navy focus-visible:outline-on-navy'
            : 'text-primary hover:text-primary-hover focus-visible:outline-primary'
        }`}
      >
        {expanded ? t('showLess') : t('learnMore')}
        <ChevronDown
          aria-hidden="true"
          className={`size-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
    </article>
  )
}
