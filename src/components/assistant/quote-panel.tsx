'use client'

import { Minus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { trackEvent } from '@/lib/analytics'
import { useChat } from '@/hooks/use-chat'
import { MessageList } from '@/components/chat/message-list'
import { MessageInput } from '@/components/chat/message-input'
import { TypingIndicator } from '@/components/chat/typing-indicator'
import { ErrorMessage } from '@/components/feedback/error-message'
import { ConnectionStatus } from '@/components/feedback/connection-status'
import { Spinner } from '@/components/ui/spinner'
import { COMPANY_NAME } from '@/content/site'

/**
 * The live quote conversation inside the floating assistant. Mounting this
 * component opens the chat session; it stays mounted while minimized so the
 * connection and conversation history survive.
 */
export function QuotePanel({ onMinimize }: { onMinimize: () => void }) {
  const t = useTranslations('assistant')
  const {
    messages,
    connectionState,
    operatorTyping,
    closed,
    error,
    upload,
    sendMessage,
    sendFile,
    notifyTyping,
    dismissError,
  } = useChat()

  const disconnected = connectionState === 'disconnected'

  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="flex items-center justify-between gap-3 bg-gradient-to-r from-navy to-navy-ink px-4 py-3 text-on-navy">
        <div>
          <h2 className="font-display text-base font-bold">{t('title')}</h2>
          <p className="text-xs text-navy-muted">{t('subtitle', { companyName: COMPANY_NAME })}</p>
        </div>
        <div className="flex items-center gap-1">
          <ConnectionStatus state={connectionState} className="text-navy-muted" />
          <button
            type="button"
            onClick={() => {
              trackEvent('quote_assistant_minimize', { link_id: 'assistant-minimize', section: 'assistant' })
              onMinimize()
            }}
            aria-label={t('minimizeChat')}
            className="flex size-11 cursor-pointer items-center justify-center rounded-md text-navy-muted transition-colors duration-150 hover:bg-white/10 hover:text-on-navy focus-visible:outline-2 focus-visible:outline-on-navy"
          >
            <Minus aria-hidden="true" className="size-5" />
          </button>
        </div>
      </header>

      {error !== null && (
        <div className="px-4 pt-3">
          <ErrorMessage message={error} onDismiss={dismissError} />
        </div>
      )}

      {connectionState === 'connecting' && messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner label={t('connecting')} />
        </div>
      ) : (
        <MessageList messages={messages} />
      )}

      <div className="min-h-6 px-4">
        {operatorTyping && <TypingIndicator />}
        {upload !== null && (
          <p role="status" className="truncate text-sm text-foreground-secondary">
            {t('uploading', {
              fileName: upload.fileName,
              percent: Math.round(upload.progress * 100),
            })}
          </p>
        )}
      </div>

      {disconnected ? (
        <p role="status" className="border-t border-border bg-surface p-4 text-center text-sm text-foreground-secondary">
          {closed ? t('closedByOperator') : t('ended')}
        </p>
      ) : (
        <MessageInput
          disabled={connectionState !== 'connected'}
          uploading={upload !== null}
          onSend={sendMessage}
          onSendFile={sendFile}
          onTyping={notifyTyping}
        />
      )}
    </div>
  )
}
