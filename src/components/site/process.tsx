import { useLocale, useTranslations } from 'next-intl'
import { PROCESS_STEPS } from '@/content/site'
import { sectionId } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

export function Process() {
  const t = useTranslations('process')
  const locale = useLocale() as Locale

  return (
    <section id={sectionId(locale, 'process')} className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('title')} align="center" />
        {/* The connector is a sibling of the list, not a child: <ol> may only
            contain <li>, and aria-hidden does not make invalid markup valid. */}
        <div className="relative mt-14 sm:mt-16">
          {/* Connector line between the step markers on large screens. */}
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-6 hidden border-t-2 border-dashed border-border-strong lg:block"
          />
          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {PROCESS_STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <li key={step.id} className="relative text-center">
                  <Reveal delay={index * 100}>
                    <span
                      aria-hidden="true"
                      className="relative z-10 mx-auto flex size-12 items-center justify-center rounded-full bg-gradient-to-b from-primary to-primary-pressed text-on-primary shadow-button ring-4 ring-primary-soft"
                    >
                      <Icon className="size-5" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                      {t(`steps.${step.id}.title`)}
                    </h3>
                    <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-foreground-secondary">
                      {t(`steps.${step.id}.text`)}
                    </p>
                  </Reveal>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
