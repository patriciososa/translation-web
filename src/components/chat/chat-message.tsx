import { useTranslations } from 'next-intl'
import { FileMessage } from './file-message'
import type { ChatMessage as ChatMessageModel } from '@/types/chat'
import { formatTime } from '@/utils/format-time'

export function ChatMessage({ message }: { message: ChatMessageModel }) {
  const t = useTranslations('chat')
  const isCustomer = message.sender === 'customer'
  const senderLabel = isCustomer ? t('you') : t('specialist')

  return (
    <li className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 shadow-soft sm:max-w-[70%] ${
          isCustomer ? 'rounded-br-sm bg-customer-bubble' : 'rounded-bl-sm border border-border bg-surface'
        }`}
      >
        {message.attachment !== undefined ? (
          <FileMessage attachment={message.attachment} />
        ) : (
          <p className="whitespace-pre-wrap break-words text-base text-foreground">{message.text}</p>
        )}
        <p className="mt-1 text-xs text-muted">
          <span className="sr-only">{senderLabel}, </span>
          <time dateTime={new Date(message.timestamp).toISOString()}>
            {formatTime(message.timestamp)}
          </time>
        </p>
      </div>
    </li>
  )
}
