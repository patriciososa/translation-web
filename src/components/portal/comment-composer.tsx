'use client'

import { MessageSquarePlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { floatingStyle, SmallButton } from './comment-popover'
import { MAX_COMMENT_LENGTH } from './text-ranges'

export interface PendingSelection {
  paragraphIndex: number
  start: number
  end: number
  quote: string
  rect: DOMRect
}

/**
 * Appears next to a text selection: first a "Comment" button, then the form.
 * The selection is captured when the button is pressed, so later clicks into
 * the textarea (which clear the page selection) do not lose it.
 */
export function CommentComposer({
  selection,
  onSubmit,
  onCancel,
}: {
  selection: PendingSelection
  onSubmit: (text: string) => Promise<boolean>
  onCancel: () => void
}) {
  const t = useTranslations('portal')
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  if (!open) {
    return (
      <div style={floatingStyle(selection.rect, 140)} className="z-40">
        <button
          type="button"
          // mousedown, not click: keep the page selection alive until we have it.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen(true)}
          className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-on-primary shadow-raised hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <MessageSquarePlus aria-hidden="true" className="size-4" />
          {t('addComment')}
        </button>
      </div>
    )
  }

  const quote = selection.quote.length > 80 ? `${selection.quote.slice(0, 80)}…` : selection.quote
  return (
    <form
      role="dialog"
      aria-label={t('addComment')}
      style={floatingStyle(selection.rect)}
      className="z-40 animate-menu-in rounded-lg border border-border-strong bg-surface p-3 shadow-lifted"
      onKeyDown={(event) => event.key === 'Escape' && onCancel()}
      onSubmit={async (event) => {
        event.preventDefault()
        setBusy(true)
        const ok = await onSubmit(text)
        setBusy(false)
        if (ok) onCancel()
      }}
    >
      <p className="mb-2 line-clamp-2 border-l-2 border-accent pl-2 text-xs italic text-foreground-secondary">
        {t('commentOn', { quote })}
      </p>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={t('commentPlaceholder')}
        maxLength={MAX_COMMENT_LENGTH}
        rows={3}
        autoFocus
        className="w-full resize-y rounded-md border border-border-strong bg-background p-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-primary"
      />
      {text.length >= MAX_COMMENT_LENGTH && (
        <p className="mt-1 text-xs text-warning">{t('commentTooLong', { max: MAX_COMMENT_LENGTH })}</p>
      )}
      <div className="mt-2 flex justify-end gap-2">
        <SmallButton onClick={onCancel}>{t('cancel')}</SmallButton>
        <SmallButton type="submit" primary disabled={busy || text.trim() === ''}>
          {t('send')}
        </SmallButton>
      </div>
    </form>
  )
}
