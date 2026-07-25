import Image from 'next/image'
import { BadgeCheck, MessageCircle } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { sectionId } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { QuoteChatButton } from './quote-chat-button'

/**
 * The hero, over a full-bleed photograph of a translator's desk (generated with
 * Nano Banana Pro in the Instagram set's photographic direction; the prompt and
 * the 2K master live in web/brand-assets/hero).
 *
 * The picture is composed for this job: its whole left half is bare desktop, so
 * the headline lands on empty surface rather than on the monitor. That alone is
 * not contrast, though — a photograph is fixed while the page has two themes —
 * so the text sits on a scrim built from --background itself: opaque under the
 * column, fading out across the picture. Because the token flips with the
 * theme, the same markup gives dark text on a light wash and light text on a
 * dark one, and the image is additionally dimmed in dark mode, where a bright
 * white desk would otherwise glare out of a near-black page.
 */
export function Hero() {
  const t = useTranslations('hero')
  const tContact = useTranslations('contact')
  const locale = useLocale() as Locale

  return (
    <section
      id={sectionId(locale, 'top')}
      className="relative isolate overflow-hidden bg-background"
    >
      {/* Decorative: the copy beside it says everything this picture says. */}
      <Image
        src="/hero-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-right dark:opacity-40"
      />
      {/* The readability scrim. Solid-ish on a phone, where the text spans the
          full width; a left-to-right fade from lg up, where it only has to
          cover the column. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-background/88 lg:bg-transparent lg:bg-gradient-to-r lg:from-background lg:from-35% lg:via-background/85 lg:via-60% lg:to-transparent"
      />
      <div className="relative mx-auto flex min-h-[540px] max-w-7xl items-center px-4 pb-16 pt-14 sm:px-6 lg:min-h-[620px] lg:px-8 lg:pb-24 lg:pt-24">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
            {t('headline')}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-pretty text-foreground-secondary">
            {t('subtext')}
          </p>
          {/* Above the fold the assistant has no other entry point than the header button. */}
          <QuoteChatButton
            variant="primary"
            location="hero"
            className="mt-8"
            icon={<MessageCircle aria-hidden="true" className="size-4" />}
          >
            {tContact('cta')}
          </QuoteChatButton>
          <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-foreground-secondary">
            <BadgeCheck aria-hidden="true" className="size-4 shrink-0 text-primary" />
            {tContact('ctaNote')}
          </p>
        </div>
      </div>
    </section>
  )
}
