import { ChevronDown } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { FAQS } from '@/content/site'
import type { FaqId } from '@/content/site'
import { TrackedDetails } from '@/components/ui/tracked'
import { sectionId } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { SectionHeading } from './section-heading'
import { SECTION_TONE_CLASSES } from './section-tone'
import type { SectionTone } from './section-tone'

/** Accordion built on native details/summary: accessible with zero JavaScript. */
export function Faq({
  items = FAQS,
  tone = 'surface',
}: {
  items?: readonly FaqId[]
  tone?: SectionTone
}) {
  const t = useTranslations('faq')
  const locale = useLocale() as Locale

  return (
    <section id={sectionId(locale, 'faq')} className={`${SECTION_TONE_CLASSES[tone]} py-16 sm:py-24`}>
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
              <FaqAnswer text={t(`items.${faq}.answer`)} />
            </TrackedDetails>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * An answer is one paragraph unless its message has line breaks, in which case
 * each line is a list row and whatever precedes its first colon is the row's
 * label ("Argentina: …"). The payment answer is the one that needs it — the
 * methods differ per country. Kept in the single `answer` string rather than in
 * keys of its own because the FAQPage JSON-LD reads the same message.
 */
function FaqAnswer({ text }: { text: string }) {
  const lines = text.split('\n')
  if (lines.length === 1) {
    return <p className="pb-6 pr-9 text-[15px] leading-relaxed text-foreground-secondary">{text}</p>
  }
  return (
    <ul className="space-y-2 pb-6 pr-9 text-[15px] leading-relaxed text-foreground-secondary">
      {lines.map((line) => {
        // \s? before the colon: French sets a no-break space there, and it
        // stays inside the label.
        const match = /^(.+?\s?:)\s(.*)$/.exec(line)
        return (
          <li key={line}>
            {match === null ? (
              line
            ) : (
              <>
                <span className="font-semibold text-foreground">{match[1]}</span> {match[2]}
              </>
            )}
          </li>
        )
      })}
    </ul>
  )
}
