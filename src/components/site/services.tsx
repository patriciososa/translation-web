import { useTranslations } from 'next-intl'
import { SERVICES } from '@/content/site'
import { Reveal } from './reveal'
import { SectionHeading } from './section-heading'
import { ServiceCard } from './service-card'

export function Services() {
  const t = useTranslations('services')

  return (
    <section id="services" className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('title')} description={t('description')} />
        <div className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, ...service }, index) => (
            <Reveal key={service.id} delay={(index % 3) * 80} className="h-full">
              <ServiceCard service={service} icon={<Icon className="size-5" />} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
