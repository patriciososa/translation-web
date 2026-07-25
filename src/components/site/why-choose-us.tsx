import { useLocale, useTranslations } from 'next-intl'
import { WHY_CHOOSE_US } from '@/content/site'
import { sectionId } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { Reveal } from './reveal'

export function WhyChooseUs() {
  const t = useTranslations('about')
  const locale = useLocale() as Locale

  return (
    <section id={sectionId(locale, 'about')} className="bg-background py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-foreground-secondary">
            {t('lead')}
          </p>
          <p className="mt-4 text-base leading-relaxed text-foreground-secondary">
            {t('confidentiality')}
          </p>
        </div>

        {/* Icon and name only: stripped of their sentence of prose these are
            claims, not explanations, so they read as a bordered set — the same
            treatment the industry chips carry — instead of six stray icons
            floating on the section background. */}
        <ul className="grid gap-4 sm:grid-cols-2">
          {WHY_CHOOSE_US.map((feature, index) => {
            const Icon = feature.icon
            return (
              <li key={feature.id}>
                <Reveal delay={(index % 2) * 60} className="h-full">
                  <div className="flex h-full items-center gap-3.5 rounded-xl border border-border bg-surface px-5 py-4 shadow-soft transition-all duration-300 hover:border-border-strong hover:shadow-raised motion-safe:hover:-translate-y-0.5">
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent ring-1 ring-accent/15"
                    >
                      <Icon className="size-5" />
                    </span>
                    <h3 className="font-display text-base font-bold text-balance text-foreground">
                      {t(`features.${feature.id}.title`)}
                    </h3>
                  </div>
                </Reveal>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
