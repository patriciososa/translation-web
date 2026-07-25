import { useTranslations } from 'next-intl'
import { PROJECT_MILESTONES } from '@/content/site'
import { Reveal } from './reveal'

/**
 * What happens after the quotation is accepted: the customer is emailed at
 * every milestone instead of having to ask how their translation is going.
 *
 * Rendered on the dark brand band rather than in the page's
 * surface/background alternation, the role the old stats band used to play —
 * the sections around it stay in rhythm, and the milestone rail echoes the
 * timeline drawn in the progress emails themselves.
 */
export function ProjectUpdates() {
  const t = useTranslations('updates')

  // The hairlines are load-bearing in dark mode: brand navy sits within 0.09
  // contrast of --surface there, so the band's edges would otherwise read as
  // one continuous dark block with the sections around it.
  return (
    <section className="border-y border-white/10 bg-gradient-to-b from-navy to-navy-ink py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-balance text-on-navy sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-navy-muted">
            {t('description')}
          </p>
        </div>

        {/* The rail is a sibling of the list, not a child: <ol> may only
            contain <li>, and aria-hidden does not make invalid markup valid. */}
        <div className="relative mt-14 sm:mt-16">
          {/* Rail joining the milestone markers, as in the progress emails. */}
          <div
            aria-hidden="true"
            className="absolute left-[8.333%] right-[8.333%] top-6 hidden border-t-2 border-dashed border-white/15 lg:block"
          />
          {/* Two-up from the smallest screen: six milestones in one column is a
              scroll, not a timeline. */}
          <ol className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
            {PROJECT_MILESTONES.map((milestone, index) => {
              const Icon = milestone.icon
              return (
                <li key={milestone.id} className="relative min-w-0 text-center">
                  <Reveal delay={index * 80}>
                    <span
                      aria-hidden="true"
                      className="relative z-10 mx-auto flex size-12 items-center justify-center rounded-full bg-navy-ink text-on-navy ring-1 ring-white/15"
                    >
                      <Icon className="size-5" />
                    </span>
                    {/* A long word sets the width here: German's
                        "Übersetzerzuweisung" was wider than the two-column
                        track at 320px and pushed the whole band past the
                        viewport. The locale is gone, the guard stays. */}
                    <h3 className="mt-4 text-sm font-semibold text-on-navy hyphens-auto break-words">
                      {t(`milestones.${milestone.id}`)}
                    </h3>
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
