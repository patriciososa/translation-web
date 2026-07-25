import { COMPANY_ALTERNATE_NAME, COMPANY_NAME } from '@/content/site'

/**
 * Splits chat text into plain runs and the pieces worth marking inside it: the
 * links, so a message can render `info@translations.bluelab.ar` or a
 * careers-page URL as something clickable, and the brand name, so the operator
 * introducing the agency reads as the agency rather than as more prose. The
 * bot writes all of them in ordinary prose (see the API's welcome and the
 * operator bot's channel list), and until now they arrived as dead text.
 *
 * Deliberately a plain tokenizer rather than markup: the message text is user
 * and model input, so it must never reach the DOM as HTML. The caller turns
 * these tokens into elements, and `href` is always one this module built —
 * mailto:, https://, or a scheme we matched ourselves — so no `javascript:`
 * URL can ride in from the text.
 */
export interface LinkToken {
  type: 'text' | 'url' | 'whatsapp' | 'email' | 'brand'
  /**
   * The run as written in the message; what the reader sees — except for a
   * `whatsapp` link, which the caller labels instead of printing its URL.
   */
  text: string
  /** Where it points. Absent on plain text and brand runs. */
  href?: string
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * The trade name, then the bare company name — longest first, so "Bluelab
 * Translations" is marked as one name instead of leaving "Translations"
 * behind. Matched case-sensitively on purpose: it keeps the brand out of the
 * lowercase host in `translations.bluelab.ar`, which belongs to the link that
 * contains it.
 */
const BRAND = [COMPANY_ALTERNATE_NAME, COMPANY_NAME].map(escapeRegExp).join('|')

/**
 * http(s) links, bare www. hosts, email addresses, and the brand name, in that
 * order. Links come first so an address that happens to contain the brand is
 * still tokenized as the address.
 */
const CANDIDATE = new RegExp(
  `(https?:\\/\\/[^\\s<>]+|www\\.[^\\s<>]+|[^\\s<>@]+@[^\\s<>@]+\\.[A-Za-z]{2,}|\\b(?:${BRAND})\\b)`,
  'g',
)

/**
 * Punctuation that ends a sentence rather than the link. "Escríbanos a
 * info@bluelab.ar." must not send mail to an address ending in a full stop.
 */
const TRAILING = /[.,;:!?)\]}'"»…]+$/

const EMAIL = /^[^\s<>@]+@[^\s<>@]+\.[A-Za-z]{2,}$/

/**
 * The link that opens a chat with one of our lines (the operator bot writes
 * it when the chat will not take a file). Its URL is a phone number in a
 * query string — nothing a customer needs to read.
 */
const WHATSAPP = /^https:\/\/(?:api\.whatsapp\.com|wa\.me)\//

const IS_BRAND = new RegExp(`^(?:${BRAND})$`)

export function tokenizeLinks(text: string): LinkToken[] {
  const tokens: LinkToken[] = []
  let lastIndex = 0

  for (const match of text.matchAll(CANDIDATE)) {
    const start = match.index
    const raw = match[0]
    const trailing = TRAILING.exec(raw)?.[0] ?? ''
    const value = trailing === '' ? raw : raw.slice(0, -trailing.length)

    // A candidate that was nothing but punctuation leaves no link behind.
    if (value === '') continue

    if (start > lastIndex) tokens.push({ type: 'text', text: text.slice(lastIndex, start) })

    if (IS_BRAND.test(value)) {
      tokens.push({ type: 'brand', text: value })
    } else if (EMAIL.test(value)) {
      tokens.push({ type: 'email', text: value, href: `mailto:${value}` })
    } else {
      const href = value.startsWith('http') ? value : `https://${value}`
      tokens.push({ type: WHATSAPP.test(href) ? 'whatsapp' : 'url', text: value, href })
    }

    if (trailing !== '') tokens.push({ type: 'text', text: trailing })
    lastIndex = start + raw.length
  }

  if (lastIndex < text.length) tokens.push({ type: 'text', text: text.slice(lastIndex) })
  return tokens
}
