import { Check } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { FEATURED_INDUSTRIES, INDUSTRIES } from '@/content/site'
import { sectionId } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

export function Industries() {
  const t = useTranslations('industries')
  const locale = useLocale() as Locale

  return (
    <section id={sectionId(locale, 'industries')} className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('title')} description={t('description')} />

        <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2">
          {FEATURED_INDUSTRIES.map((industry, index) => {
            const Icon = industry.icon
            const documents = t.raw(`items.${industry.id}.documents`) as string[]
            return (
              <Reveal key={industry.id} delay={(index % 2) * 80} className="h-full min-w-0">
                <article className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 shadow-soft transition-all duration-300 hover:border-border-strong hover:shadow-raised motion-safe:hover:-translate-y-0.5 sm:p-7">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary ring-1 ring-primary/10"
                    >
                      <Icon className="size-5" />
                    </span>
                    {/* A long unbreakable name sets this card's min-content
                        width: German's "Informationstechnologie" beside the
                        44px icon asked for a 334px grid track inside a 288px
                        container, which pushed the layout viewport past 320px
                        and cut the cards off. German is no longer a locale, but
                        the guard stays — it costs nothing and any locale can
                        grow a word this long. The min-w-0 above lets the track
                        shrink; these let the word break instead of the card. */}
                    <h3 className="min-w-0 font-display text-xl font-bold tracking-tight text-foreground hyphens-auto break-words">
                      {t(`items.${industry.id}.name`)}
                    </h3>
                  </div>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {documents.map((document) => (
                      <li key={document} className="flex items-start gap-2 text-sm text-foreground-secondary">
                        <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                        {document}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            )
          })}
        </div>

        {/* A wrap row, not a grid: these carry only a name now, and they
            leave a lone card in the last row of most column counts that fit.
            Wrapping makes the ragged end read as intentional, the way the
            language chips already do.
            Each chip stays at its content width — letting them grow turns a
            last row of one into a full-width bar, which is what French does
            ("Industrie manufacturière" pushes Énergie onto its own line). */}
        <div className="mt-6 flex flex-wrap gap-4">
          {INDUSTRIES.map((industry) => {
            const Icon = industry.icon
            return (
              <article
                key={industry.id}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-5 py-4 shadow-soft transition-all duration-300 hover:border-border-strong hover:shadow-raised"
              >
                <Icon aria-hidden="true" className="size-5 shrink-0 text-primary" />
                <h3 className="font-display text-base font-bold text-foreground">
                  {t(`items.${industry.id}.name`)}
                </h3>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
