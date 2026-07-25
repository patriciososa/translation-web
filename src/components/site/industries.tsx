import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FEATURED_INDUSTRIES, INDUSTRIES } from '@/content/site'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

export function Industries() {
  const t = useTranslations('industries')

  return (
    <section id="industries" className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('title')} description={t('description')} />

        <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2">
          {FEATURED_INDUSTRIES.map((industry, index) => {
            const Icon = industry.icon
            const documents = t.raw(`items.${industry.id}.documents`) as string[]
            return (
              <Reveal key={industry.id} delay={(index % 2) * 80} className="h-full">
                <article className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 shadow-soft transition-all duration-300 hover:border-border-strong hover:shadow-raised motion-safe:hover:-translate-y-0.5 sm:p-7">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-11 items-center justify-center rounded-lg bg-primary-soft text-primary ring-1 ring-primary/10"
                    >
                      <Icon className="size-5" />
                    </span>
                    <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                      {t(`items.${industry.id}.name`)}
                    </h3>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-foreground-secondary">
                    {t(`items.${industry.id}.description`)}
                  </p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {documents.map((document) => (
                      <li key={document} className="flex items-start gap-2 text-sm text-foreground-secondary">
                        <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                        {document}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto pt-4 text-sm font-medium text-muted">
                    {t(`items.${industry.id}.terminology`)}
                  </p>
                </article>
              </Reveal>
            )
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INDUSTRIES.map((industry) => {
            const Icon = industry.icon
            return (
              <article
                key={industry.id}
                className="rounded-xl border border-border bg-surface p-5 shadow-soft transition-all duration-300 hover:border-border-strong hover:shadow-raised"
              >
                <div className="flex items-center gap-2.5">
                  <Icon aria-hidden="true" className="size-5 text-primary" />
                  <h3 className="font-display text-base font-bold text-foreground">
                    {t(`items.${industry.id}.name`)}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">
                  {t(`items.${industry.id}.description`)}
                </p>
                <p className="mt-2 text-xs font-medium text-muted">
                  {t(`items.${industry.id}.terminology`)}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
