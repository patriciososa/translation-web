'use client'

import { CheckCircle2, RotateCcw } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import type { PortalComment, PortalRole } from '@/types/portal'
import { MAX_COMMENT_LENGTH } from './text-ranges'

/** Fixed-position card anchored under (or above, near the bottom) a rect. */
export function floatingStyle(rect: DOMRect, width = 340): React.CSSProperties {
  const margin = 8
  const left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin))
  const below = rect.bottom + margin
  const placeAbove = below > window.innerHeight - 220 && rect.top > 240
  return placeAbove
    ? { position: 'fixed', left, bottom: window.innerHeight - rect.top + margin, width }
    : { position: 'fixed', left, top: below, width }
}

/** What the viewer may do with comments; every handler resolves to whether it worked. */
export interface CommentActions {
  role: PortalRole
  onEdit: (comment: PortalComment, text: string) => Promise<boolean>
  onDelete: (comment: PortalComment) => Promise<boolean>
  onResolve: (comment: PortalComment, resolution: string) => Promise<boolean>
  onReopen: (comment: PortalComment) => Promise<boolean>
}

/** Mirrors the backend: translator and reviewer resolve; they or the author reopen. */
export function canResolve(role: PortalRole): boolean {
  return role === 'translator' || role === 'reviewer'
}

interface CommentPopoverProps {
  comments: PortalComment[]
  rect: DOMRect
  /** Hover preview: read-only, no actions, no focus trap. */
  preview?: boolean
  onClose: () => void
  actions: CommentActions
}

export function CommentPopover({ comments, rect, preview = false, onClose, actions }: CommentPopoverProps) {
  const t = useTranslations('portal')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (preview) return
    ref.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    const onPointer = (event: PointerEvent) => {
      if (ref.current !== null && !ref.current.contains(event.target as Node)) onClose()
    }
    document.addEventListener('keydown', onKey)
    // Next tick, so the click that opened the popover does not close it.
    const id = window.setTimeout(() => document.addEventListener('pointerdown', onPointer), 0)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
      window.clearTimeout(id)
    }
  }, [preview, onClose])

  return (
    <div
      ref={ref}
      role={preview ? 'tooltip' : 'dialog'}
      aria-label={t('commentsTitle')}
      tabIndex={-1}
      style={floatingStyle(rect)}
      className={`z-40 max-h-[60vh] overflow-y-auto rounded-lg border border-border-strong bg-surface p-3 shadow-lifted outline-none ${
        preview ? 'pointer-events-none' : 'animate-menu-in'
      }`}
    >
      <ul className="space-y-3 divide-y divide-border [&>li+li]:pt-3">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            preview={preview}
            actions={{
              ...actions,
              onDelete: async (c) => {
                const ok = await actions.onDelete(c)
                if (ok && comments.length === 1) onClose()
                return ok
              },
            }}
          />
        ))}
      </ul>
    </div>
  )
}

export function CommentItem({
  comment,
  preview = false,
  actions,
}: {
  comment: PortalComment
  preview?: boolean
  actions: CommentActions
}) {
  const t = useTranslations('portal')
  const format = useFormatter()
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm' | 'resolve'>('view')
  const [draft, setDraft] = useState(comment.text)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const when = (ms: number) => format.dateTime(new Date(ms), { dateStyle: 'medium', timeStyle: 'short' })
  const resolved = comment.resolvedAt !== null
  const mayResolve = canResolve(actions.role)
  const mayReopen = mayResolve || comment.mine
  const suggest = !resolved && comment.anchorStatus === 'changed' && mayResolve

  async function run(action: () => Promise<boolean>, after: () => void = () => setMode('view')) {
    setBusy(true)
    const ok = await action()
    setBusy(false)
    if (ok) after()
  }

  return (
    <li className={`text-sm ${resolved ? 'opacity-80' : ''}`}>
      <div className="mb-1 flex flex-wrap items-baseline gap-x-2 text-xs text-muted">
        <span className="font-semibold text-foreground">{comment.authorAlias}</span>
        <span>{t(`role.${comment.authorRole}`)}</span>
        <span>· {when(comment.createdAt)}</span>
        {comment.editedAt !== null && <span>· {t('edited', { time: when(comment.editedAt) })}</span>}
      </div>
      {!resolved && comment.anchorStatus === 'changed' && !suggest && (
        <p className="mb-1 text-xs text-warning">{t('textChangedHint')}</p>
      )}
      <p className="mb-1 line-clamp-2 border-l-2 border-accent pl-2 text-xs italic text-foreground-secondary">
        {comment.quote}
      </p>

      {mode === 'edit' ? (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void run(() => actions.onEdit(comment, draft))
          }}
        >
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
            rows={3}
            autoFocus
            className="w-full resize-y rounded-md border border-border-strong bg-background p-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          />
          <div className="mt-2 flex justify-end gap-2">
            <SmallButton onClick={() => { setDraft(comment.text); setMode('view') }}>{t('cancel')}</SmallButton>
            <SmallButton type="submit" primary disabled={busy || draft.trim() === ''}>{t('save')}</SmallButton>
          </div>
        </form>
      ) : (
        <p className={`whitespace-pre-wrap text-foreground ${resolved ? 'line-through decoration-muted/60' : ''}`}>
          {comment.text}
        </p>
      )}

      {resolved && (
        <div className="mt-2 rounded-md border border-success/30 bg-success/10 p-2 text-xs">
          <p className="flex items-center gap-1 font-semibold text-success">
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            {t('resolvedBy', { alias: comment.resolvedByAlias ?? '', time: when(comment.resolvedAt!) })}
          </p>
          {comment.resolution !== null && (
            <p className="mt-1 whitespace-pre-wrap text-foreground">{comment.resolution}</p>
          )}
        </div>
      )}

      {!preview && suggest && mode === 'view' && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md bg-warning/10 p-2">
          <span className="flex-1 text-xs font-medium text-warning">{t('textChangedSuggest')}</span>
          <SmallButton primary onClick={() => setMode('resolve')}>{t('resolve')}</SmallButton>
        </div>
      )}

      {mode === 'resolve' && (
        <form
          className="mt-2"
          aria-label={t('resolveTitle')}
          onSubmit={(event) => {
            event.preventDefault()
            void run(() => actions.onResolve(comment, reply), () => {
              setReply('')
              setMode('view')
            })
          }}
        >
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder={t('resolutionPlaceholder')}
            maxLength={MAX_COMMENT_LENGTH}
            rows={2}
            autoFocus
            className="w-full resize-y rounded-md border border-border-strong bg-background p-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-primary"
          />
          <div className="mt-2 flex justify-end gap-2">
            <SmallButton onClick={() => setMode('view')}>{t('cancel')}</SmallButton>
            <SmallButton type="submit" success disabled={busy}>{t('resolve')}</SmallButton>
          </div>
        </form>
      )}

      {!preview && mode === 'view' && (
        <div className="mt-2 flex flex-wrap gap-2">
          {!resolved && mayResolve && !suggest && (
            <SmallButton success onClick={() => setMode('resolve')}>
              <CheckCircle2 aria-hidden="true" className="mr-1 size-3.5" />
              {t('resolve')}
            </SmallButton>
          )}
          {resolved && mayReopen && (
            <SmallButton disabled={busy} onClick={() => void run(() => actions.onReopen(comment))}>
              <RotateCcw aria-hidden="true" className="mr-1 size-3.5" />
              {t('reopen')}
            </SmallButton>
          )}
          {comment.mine && (
            <>
              <SmallButton onClick={() => setMode('edit')}>{t('edit')}</SmallButton>
              <SmallButton onClick={() => setMode('confirm')}>{t('delete')}</SmallButton>
            </>
          )}
        </div>
      )}
      {mode === 'confirm' && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md bg-error/10 p-2" role="alert">
          <span className="flex-1 text-xs font-medium text-error">{t('confirmDelete')}</span>
          <SmallButton onClick={() => setMode('view')}>{t('cancel')}</SmallButton>
          <SmallButton danger disabled={busy} onClick={() => void run(() => actions.onDelete(comment))}>
            {t('confirmDeleteYes')}
          </SmallButton>
        </div>
      )}
    </li>
  )
}

export function SmallButton({
  children,
  primary = false,
  success = false,
  danger = false,
  type = 'button',
  disabled,
  onClick,
}: {
  children: React.ReactNode
  primary?: boolean
  success?: boolean
  danger?: boolean
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
}) {
  const tone = danger
    ? 'bg-error text-white hover:opacity-90'
    : success
      ? 'bg-success text-white hover:opacity-90 dark:text-background'
      : primary
        ? 'bg-primary text-on-primary hover:bg-primary-hover'
        : 'border border-border-strong bg-surface text-foreground hover:bg-surface-secondary'
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-8 cursor-pointer items-center rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${tone}`}
    >
      {children}
    </button>
  )
}
