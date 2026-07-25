import { ArrowLeftRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LANGUAGE_PRESERVATION, SERVICE_LANGUAGES } from '@/content/site'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'

/**
 * The seven service languages, carried horizontally across the section.
 *
 * The enumerated pairs that used to follow are gone: twenty-one of them read as
 * a wall of text, and "any direction, any combination" already says it. The
 * chips plus that line carry the meaning in a fraction of the height.
 */
export function LanguagesSection() {
  const t = useTranslations('languages')

  return (
    <section id="languages" className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('title')} description={t('description')} />

        <Reveal className="mt-12 border-y border-border py-10 sm:mt-16 sm:py-14">
          <ul className="flex flex-wrap items-start justify-center gap-x-4 gap-y-6 sm:gap-x-8">
            {SERVICE_LANGUAGES.map((code) => (
              <li key={code} className="flex w-16 flex-col items-center gap-2 sm:w-24 sm:gap-3">
                <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-navy to-navy-ink font-display text-sm font-bold text-on-navy shadow-soft sm:size-16 sm:text-base">
                  {code.toUpperCase()}
                </span>
                <span className="text-center font-display text-xs font-bold tracking-tight text-foreground sm:text-sm">
                  {t(`names.${code}`)}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-8 flex items-center justify-center gap-2.5 font-display text-lg font-bold tracking-tight text-foreground sm:mt-10 sm:text-2xl">
            <ArrowLeftRight aria-hidden="true" className="size-5 shrink-0 text-accent sm:size-6" />
            {t('anyCombination')}
          </p>
        </Reveal>

        <div className="mt-12 grid gap-8 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {LANGUAGE_PRESERVATION.map((point) => (
            <div key={point}>
              <h3 className="font-display text-base font-bold text-foreground">
                {t(`preservation.${point}.title`)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground-secondary">
                {t(`preservation.${point}.text`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
