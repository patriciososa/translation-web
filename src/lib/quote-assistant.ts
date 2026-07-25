/**
 * Lets any part of the page open the floating quote assistant without shared
 * React context: CTA buttons dispatch a DOM event that the widget listens for.
 */
const OPEN_EVENT = 'quote-assistant:open'

export function openQuoteAssistant(): void {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

export function onQuoteAssistantOpen(handler: () => void): () => void {
  window.addEventListener(OPEN_EVENT, handler)
  return () => window.removeEventListener(OPEN_EVENT, handler)
}
