import { BadgeCheck, Mail, MessageCircle } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { TrackedAnchor } from '@/components/ui/tracked'
import { CONTACT } from '@/content/site'
import { sectionId } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { QuoteChatButton } from './quote-chat-button'
import { SectionHeading } from './section-heading'
import { SECTION_TONE_CLASSES } from './section-tone'
import type { SectionTone } from './section-tone'

export function Contact({ tone = 'background' }: { tone?: SectionTone }) {
  const t = useTranslations('contact')
  const locale = useLocale() as Locale

  return (
    <section
      id={sectionId(locale, 'contact')}
      className={`${SECTION_TONE_CLASSES[tone]} py-16 sm:py-24`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('title')} align="center" />
        <div className="relative mx-auto mt-12 max-w-2xl overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-ink p-8 text-center text-on-navy shadow-raised ring-1 ring-white/10 sm:mt-16 sm:p-12">
          {/* Soft glow inside the panel; decorative only. */}
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-24 size-64 rounded-full bg-primary/25 blur-3xl"
          />
          <div className="relative">
            <QuoteChatButton
              variant="white"
              location="contact"
              icon={<MessageCircle aria-hidden="true" className="size-4" />}
            >
              {t('cta')}
            </QuoteChatButton>
            {/* The quote being free is the objection that keeps visitors from opening the chat.
                Inline glyph rather than a flex sibling, for the reason spelled
                out on the address line below: this wraps at 375px and under. */}
            <p className="mt-4 text-center text-sm font-medium text-on-navy">
              <BadgeCheck aria-hidden="true" className="mr-1.5 inline size-4 align-[-3px]" />
              {t('ctaNote')}
            </p>
            {/* The icon flows inside the centred text rather than sitting
                beside it as a flex sibling: on a phone this line wraps in two,
                and a sibling span sizes to its widest line (the address), so
                the shorter first line centred inside it and drifted away from
                an icon still pinned to the left edge. As a leading glyph it
                wraps with the words instead. */}
            <p className="mt-6 text-center text-sm text-navy-muted">
              <Mail aria-hidden="true" className="mr-2 inline size-4 align-[-3px]" />
              {t.rich('emailLine', {
                email: CONTACT.email,
                link: (chunks) => (
                  <TrackedAnchor
                    href={`mailto:${CONTACT.email}`}
                    event="contact_email_click"
                    eventParams={{ location: 'contact', link_id: 'contact-email', section: 'contact' }}
                    /* min-h-11 is the site's touch-target size: as bare inline
                       text this address was 17px tall, too small to hit on a
                       phone. The negative margin keeps the taller box from
                       spacing the line out. */
                    className="-my-3 inline-flex min-h-11 items-center rounded-md font-medium text-on-navy underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-navy"
                  >
                    {chunks}
                  </TrackedAnchor>
                ),
              })}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
