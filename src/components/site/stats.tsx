import { useTranslations } from 'next-intl'
import { STATS } from '@/content/site'

export function Stats() {
  const t = useTranslations('stats')

  return (
    <section
      aria-label={t('ariaLabel')}
      className="bg-gradient-to-b from-navy to-navy-ink py-16 sm:py-20"
    >
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 text-center sm:px-6 md:grid-cols-5 lg:px-8">
        {STATS.map((stat) => (
          <div key={stat}>
            <dd className="font-display text-4xl font-bold tracking-tight text-on-navy tabular-nums sm:text-5xl">
              {t(`items.${stat}.value`)}
            </dd>
            <dt className="mt-2 text-sm font-medium text-navy-muted">{t(`items.${stat}.label`)}</dt>
          </div>
        ))}
      </dl>
    </section>
  )
}
