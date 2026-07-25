import { BadgeCheck, Mail, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { TrackedAnchor } from '@/components/ui/tracked'
import { CONTACT } from '@/content/site'
import { QuoteChatButton } from './quote-chat-button'
import { SectionHeading } from './section-heading'

export function Contact() {
  const t = useTranslations('contact')

  return (
    <section id="contact" className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title={t('title')} description={t('description')} align="center" />
        <div className="relative mx-auto mt-12 max-w-2xl overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-ink p-8 text-center text-on-navy shadow-raised ring-1 ring-white/10 sm:mt-16 sm:p-12">
          {/* Soft glow inside the panel; decorative only. */}
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-24 size-64 rounded-full bg-primary/25 blur-3xl"
          />
          <div className="relative">
            <h3 className="font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              {t('cardTitle')}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-navy-muted">{t('cardText')}</p>
            <QuoteChatButton variant="white" location="contact" className="mt-8">
              <MessageCircle aria-hidden="true" className="size-4" />
              {t('cta')}
            </QuoteChatButton>
            {/* The quote being free is the objection that keeps visitors from opening the chat. */}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-on-navy">
              <BadgeCheck aria-hidden="true" className="size-4 shrink-0" />
              {t('ctaNote')}
            </p>
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-navy-muted">
              <Mail aria-hidden="true" className="size-4 shrink-0" />
              <span>
                {t.rich('emailLine', {
                  email: CONTACT.email,
                  link: (chunks) => (
                    <TrackedAnchor
                      href={`mailto:${CONTACT.email}`}
                      event="contact_email_click"
                      eventParams={{ location: 'contact', link_id: 'contact-email', section: 'contact' }}
                      className="font-medium text-on-navy underline underline-offset-2"
                    >
                      {chunks}
                    </TrackedAnchor>
                  ),
                })}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
