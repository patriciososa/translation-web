import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import type { Service } from '@/content/site'

interface ServiceCardProps {
  /** Icon arrives pre-rendered because component functions cannot cross the server boundary. */
  service: Omit<Service, 'icon'>
  icon: ReactNode
}

/** A service summary: icon, title, and one line of description. */
export function ServiceCard({ service, icon }: ServiceCardProps) {
  const t = useTranslations('services')
  const featured = service.featured === true

  return (
    <article
      className={`flex h-full flex-col rounded-xl border p-6 transition-all duration-300 hover:shadow-raised motion-safe:hover:-translate-y-0.5 sm:p-7 ${
        featured
          ? 'border-navy-edge bg-gradient-to-b from-navy to-navy-ink text-on-navy'
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
    </article>
  )
}
