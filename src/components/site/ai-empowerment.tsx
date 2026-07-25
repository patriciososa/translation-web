import { useTranslations } from 'next-intl'
import { AI_POINTS } from '@/content/site'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

/**
 * Deliberately understated (h3 heading, placed late on the page): paid traffic
 * is filtered to exclude machine-translation intent, so the human-led message
 * must dominate and technology stays supporting detail.
 */
export function AiEmpowerment() {
  const t = useTranslations('ai')

  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('title')} description={t('description')} align="center" as="h3" />
        <ul className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-3">
          {AI_POINTS.map((point, index) => {
            const Icon = point.icon
            return (
              <li key={point.id}>
                <Reveal
                  delay={index * 80}
                  className="h-full rounded-xl border border-border bg-surface p-6 shadow-soft transition-all duration-300 hover:border-border-strong hover:shadow-raised sm:p-7"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent ring-1 ring-accent/15"
                  >
                    <Icon className="size-5" />
                  </span>
                  <h4 className="mt-4 font-display text-lg font-bold text-foreground">
                    {t(`points.${point.id}.title`)}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">
                    {t(`points.${point.id}.text`)}
                  </p>
                </Reveal>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
