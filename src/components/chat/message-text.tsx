import { useTranslations } from 'next-intl'

import { TrackedAnchor } from '@/components/ui/tracked'
import { tokenizeLinks } from '@/utils/linkify'

/**
 * Message body with the emails and URLs in it made clickable and the brand
 * name set apart.
 *
 * A WhatsApp link (the operator bot writes one when the chat will not take a
 * file) reads as a short label: its URL is a phone number in a query string.
 *
 * Web links open in a new tab: the assistant is a floating panel over the
 * page, and navigating it away would drop the customer out of a conversation
 * they are in the middle of. mailto: deliberately does not — it hands off to
 * the mail client, and a target here only leaves an empty tab behind.
 *
 * The link keeps the surrounding text colour and is marked by its underline
 * instead: at 4.45:1 on the customer's own bubble, --primary as text would sit
 * just under AA, and an underline carries the affordance without relying on
 * colour at all (WCAG 1.4.1).
 */
const LINK_CLASSES =
  'font-medium underline decoration-primary underline-offset-2 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/**
 * The brand carries weight rather than colour: the name turns up on both
 * bubbles and in both themes, and bold keeps it legible everywhere, where
 * --primary as body text would sit just under AA on the customer's bubble.
 */
const BRAND_CLASSES = 'font-semibold text-foreground'

export function MessageText({ text }: { text: string }) {
  const t = useTranslations('chat')
  const tokens = tokenizeLinks(text)

  return (
    <p className="whitespace-pre-wrap break-words text-base text-foreground">
      {tokens.map((token, index) => {
        if (token.type === 'brand') {
          return (
            <strong key={`${index}-${token.text}`} className={BRAND_CLASSES}>
              {token.text}
            </strong>
          )
        }

        if (token.href === undefined) return token.text

        const isEmail = token.type === 'email'
        const isWhatsApp = token.type === 'whatsapp'
        return (
          <TrackedAnchor
            key={`${index}-${token.text}`}
            href={token.href}
            event="chat_link_click"
            eventParams={{ link_id: isEmail ? 'chat-email' : isWhatsApp ? 'chat-whatsapp' : 'chat-url', section: 'assistant' }}
            className={LINK_CLASSES}
            {...(isEmail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          >
            {isWhatsApp ? t('whatsappLink') : token.text}
          </TrackedAnchor>
        )
      })}
    </p>
  )
}
