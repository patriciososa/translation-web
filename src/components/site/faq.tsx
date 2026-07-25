import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FAQS } from '@/content/site'
import type { FaqId } from '@/content/site'
import { TrackedDetails } from '@/components/ui/tracked'
import { SectionHeading } from './section-heading'

/** Accordion built on native details/summary: accessible with zero JavaScript. */
export function Faq({ items = FAQS }: { items?: readonly FaqId[] }) {
  const t = useTranslations('faq')

  return (
    <section id="faq" className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading title={t('title')} description={t('description')} align="center" />
        <div className="mt-12 divide-y divide-border border-y border-border sm:mt-16">
          {items.map((faq) => (
            <TrackedDetails key={faq} event="faq_toggle" eventParams={{ faq_id: faq, link_id: `faq-${faq}`, section: 'faq' }} className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-medium text-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                {t(`items.${faq}.question`)}
                <ChevronDown
                  aria-hidden="true"
                  className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180 group-open:text-primary"
                />
              </summary>
              <p className="pb-6 pr-9 text-[15px] leading-relaxed text-foreground-secondary">
                {t(`items.${faq}.answer`)}
              </p>
            </TrackedDetails>
          ))}
        </div>
      </div>
    </section>
  )
}
