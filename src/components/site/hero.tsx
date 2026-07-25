import { BadgeCheck, MessageCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { QuoteChatButton } from './quote-chat-button'

export function Hero() {
  const t = useTranslations('hero')
  const tContact = useTranslations('contact')

  return (
    <section id="top" className="relative overflow-hidden bg-surface">
      {/* Soft brand tint behind the showcase; decorative only. */}
      <div aria-hidden="true" className="hero-glow absolute inset-0" />
      <div
        aria-hidden="true"
        className="absolute -right-40 -top-40 size-[480px] rounded-full bg-primary-soft opacity-60 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-12 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8 lg:pb-20 lg:pt-24">
        <div>
          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
            {t('headline')}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-foreground-secondary">
            {t('subtext')}
          </p>
          {/* Above the fold the assistant has no other entry point than the header button. */}
          <QuoteChatButton variant="primary" location="hero" className="mt-8">
            <MessageCircle aria-hidden="true" className="size-4" />
            {tContact('cta')}
          </QuoteChatButton>
          <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-foreground-secondary">
            <BadgeCheck aria-hidden="true" className="size-4 shrink-0 text-primary" />
            {tContact('ctaNote')}
          </p>
        </div>
        <TranslationShowcase />
      </div>
    </section>
  )
}

/** A real translation sample, styled as two document excerpts, in place of stock imagery. */
function TranslationShowcase() {
  const t = useTranslations('hero.showcase')

  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md select-none lg:max-w-none">
      <div className="rounded-xl border border-border bg-surface p-6 shadow-raised">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          {t('sourceLabel')}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground">{t('sourceText')}</p>
      </div>
      <div className="relative z-10 -mt-4 ml-6 rounded-xl bg-gradient-to-br from-navy to-navy-ink p-6 text-on-navy shadow-lifted ring-1 ring-white/10 sm:ml-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-navy-muted">
          {t('targetLabel')}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed">{t('targetText')}</p>
      </div>
      <p className="relative z-20 -mt-3 ml-2 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-raised">
        <BadgeCheck aria-hidden="true" className="size-4 text-accent" />
        {t('badge')}
      </p>
    </div>
  )
}
