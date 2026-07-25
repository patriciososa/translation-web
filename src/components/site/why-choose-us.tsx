import { useTranslations } from 'next-intl'
import { WHY_CHOOSE_US } from '@/content/site'
import { Reveal } from './reveal'

export function WhyChooseUs() {
  const t = useTranslations('about')

  return (
    <section id="about" className="bg-background py-16 sm:py-24">
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

        <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {WHY_CHOOSE_US.map((feature, index) => {
            const Icon = feature.icon
            return (
              <li key={feature.id}>
                <Reveal delay={(index % 2) * 60}>
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-lg bg-accent-soft text-accent ring-1 ring-accent/15"
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-3 font-display text-base font-bold text-foreground">
                    {t(`features.${feature.id}.title`)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground-secondary">
                    {t(`features.${feature.id}.text`)}
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
