import { useTranslations } from 'next-intl'

export function TypingIndicator() {
  const t = useTranslations('chat')

  return (
    <p className="flex items-center gap-2 px-1 text-sm text-muted" role="status">
      <span aria-hidden="true" className="flex gap-1">
        <span className="size-1.5 animate-typing rounded-full bg-muted" />
        <span className="size-1.5 animate-typing rounded-full bg-muted [animation-delay:150ms]" />
        <span className="size-1.5 animate-typing rounded-full bg-muted [animation-delay:300ms]" />
      </span>
      {t('typing')}
    </p>
  )
}
