import { useTranslations } from 'next-intl'
import type { ConnectionState } from '@/types/chat'

const DOT_CLASSES: Record<ConnectionState, string> = {
  connecting: 'bg-warning',
  connected: 'bg-success',
  reconnecting: 'bg-warning',
  disconnected: 'bg-error',
}

interface ConnectionStatusProps {
  state: ConnectionState
  /** Overrides the label color, e.g. for rendering on dark surfaces. */
  className?: string
}

export function ConnectionStatus({ state, className = 'text-foreground-secondary' }: ConnectionStatusProps) {
  const t = useTranslations('assistant.status')

  return (
    <span className={`inline-flex items-center gap-2 text-sm ${className}`} role="status">
      <span aria-hidden="true" className={`size-2 rounded-full ${DOT_CLASSES[state]}`} />
      {t(state)}
    </span>
  )
}
