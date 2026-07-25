'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { trackEvent } from '@/lib/analytics'
import { onQuoteAssistantOpen } from '@/lib/quote-assistant'
import { QuotePanel } from './quote-panel'

/**
 * Floating quote assistant in the bottom-right corner. The chat session only
 * starts when the visitor first opens it, and the panel stays mounted while
 * minimized so the conversation continues where it left off.
 */
export function QuoteAssistant() {
  const t = useTranslations('assistant')
  const [open, setOpen] = useState(false)
  const [everOpened, setEverOpened] = useState(false)

  useEffect(
    () =>
      onQuoteAssistantOpen(() => {
        setOpen(true)
        setEverOpened(true)
      }),
    [],
  )

  // One event per visit: everOpened only ever transitions false -> true.
  // Imported in Google Ads as the secondary conversion; the primary is
  // chat_message_sent (opening without writing is not a conversion).
  useEffect(() => {
    if (everOpened) trackEvent('chat_opened', { link_id: 'chat-opened', section: 'assistant' })
  }, [everOpened])

  const toggle = () => {
    trackEvent('quote_assistant_toggle', { action: open ? 'close' : 'open', link_id: 'assistant-toggle', section: 'assistant' })
    setOpen((value) => !value)
    setEverOpened(true)
  }

  return (
    <>
      {everOpened && (
        <div
          role="dialog"
          aria-label={t('dialogLabel')}
          className={`fixed inset-0 z-50 overflow-hidden bg-surface shadow-lifted sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[380px] sm:animate-panel-in sm:rounded-2xl sm:border sm:border-border ${
            open ? '' : 'hidden'
          }`}
        >
          <QuotePanel onMinimize={() => setOpen(false)} />
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label={open ? t('minimize') : t('open')}
        className={`fixed bottom-5 right-5 z-50 flex size-14 cursor-pointer items-center justify-center rounded-full bg-primary text-on-primary shadow-lifted transition-all duration-200 hover:bg-primary-hover active:bg-primary-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-safe:hover:scale-105 motion-safe:active:scale-95 ${
          open ? 'hidden sm:flex' : ''
        }`}
      >
        {open ? (
          <X aria-hidden="true" className="size-6" />
        ) : (
          <MessageCircle aria-hidden="true" className="size-6" />
        )}
      </button>
    </>
  )
}
