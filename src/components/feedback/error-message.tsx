import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ErrorMessageProps {
  message: string
  onDismiss: () => void
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  const t = useTranslations('chat')

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-2 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('dismissError')}
        className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}
