'use client'

import { Check, CheckCheck, MessageSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useState } from 'react'
import { paragraphState } from '@/types/portal'
import type { ParagraphState, PortalComment, PortalParagraph, PortalRole } from '@/types/portal'
import { segmentText } from './text-ranges'

/**
 * Per-state look. Reviewed is green and translated blue — never the same hue —
 * and every state also carries its label and icon, so color is not the only
 * signal.
 */
const STATE_STYLE: Record<ParagraphState, { card: string; badge: string }> = {
  translated: {
    card: 'border-primary/40 bg-primary-soft/60 border-l-4 border-l-primary',
    badge: 'bg-primary text-on-primary',
  },
  reviewed: {
    card: 'border-success/40 bg-success/10 border-l-4 border-l-success',
    badge: 'bg-success text-white dark:text-background',
  },
}

// One check for translated, two for reviewed.
const STATE_ICON: Record<ParagraphState, typeof Check> = {
  translated: Check,
  reviewed: CheckCheck,
}

interface ParagraphCardProps {
  paragraph: PortalParagraph
  comments: PortalComment[]
  role: PortalRole
  busy: boolean
  activeCommentIds: string[]
  /** Reviewer only: there is no manual "translated" (the Google Doc is the translation). */
  onToggle: (index: number, change: { reviewed: boolean }) => void
  /** Pointer over / click on a highlight: the comments covering it and where it is. */
  onHighlightHover: (commentIds: string[] | null, rect: DOMRect | null) => void
  onHighlightOpen: (commentIds: string[], rect: DOMRect) => void
}

/**
 * Memoised: the document re-renders on every hover, popover and live event,
 * and a long one has hundreds of these. Its parent passes stable callbacks and
 * stable empty arrays so that only the cards a change touches render again.
 */
export const ParagraphCard = memo(function ParagraphCard({
  paragraph,
  comments,
  role,
  busy,
  activeCommentIds,
  onToggle,
  onHighlightHover,
  onHighlightOpen,
}: ParagraphCardProps) {
  const t = useTranslations('portal')
  const [showOriginal, setShowOriginal] = useState(false)
  // Everything shown is in the Google Doc, so it is translated or reviewed.
  const state: ParagraphState = paragraphState(paragraph)
  const Icon = STATE_ICON[state]
  const segments = segmentText(paragraph.currentText, comments)
  const changed = comments.filter((c) => c.anchorStatus === 'changed').length
  const hasOriginal = paragraph.originalText !== '' && paragraph.originalText !== paragraph.currentText

  return (
    <article
      id={`paragraph-${paragraph.index}`}
      aria-label={t('paragraphLabel', { number: paragraph.index + 1 })}
      // content-visibility: off-screen cards skip layout and paint; the
      // intrinsic size is a first guess, then the browser remembers the real one.
      className={`rounded-lg border p-4 shadow-soft transition-colors [contain-intrinsic-size:auto_160px] [content-visibility:auto] sm:p-5 ${STATE_STYLE[state].card}`}
    >
      <header className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium text-muted">{t('paragraphLabel', { number: paragraph.index + 1 })}</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${STATE_STYLE[state].badge}`}>
          <Icon aria-hidden="true" className="size-3.5" />
          {t(`state.${state}`)}
        </span>
        {comments.length > 0 && (
          // Same pastel as the highlighted text it counts.
          <span className="inline-flex items-center gap-1 rounded-full bg-highlight px-2 py-0.5 font-medium text-on-highlight">
            <MessageSquare aria-hidden="true" className="size-3.5" />
            {t('commentCount', { count: comments.length })}
          </span>
        )}
        {changed > 0 && (
          <span className="text-warning" title={t('textChangedHint')}>
            · {t('textChanged')} ({changed})
          </span>
        )}
      </header>

      {/* Only the paragraph's text lives in here: selection offsets are counted
          against this element's textContent, which must equal currentText. */}
      <p
        data-paragraph-text={paragraph.index}
        className="whitespace-pre-wrap text-[15px] leading-7 text-foreground"
      >
        {segments.map((segment) =>
          segment.commentIds.length === 0 ? (
            <span key={segment.start}>{segment.text}</span>
          ) : (
            <mark
              key={segment.start}
              tabIndex={0}
              role="button"
              aria-label={t('commentCount', { count: segment.commentIds.length })}
              className={`cursor-pointer rounded-[3px] px-px text-on-highlight decoration-on-highlight/70 underline-offset-4 outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent ${
                segment.commentIds.length > 1 ? 'bg-highlight-strong' : 'bg-highlight'
              } ${segment.commentIds.some((id) => activeCommentIds.includes(id)) ? 'underline decoration-2' : ''}`}
              onMouseEnter={(event) => onHighlightHover(segment.commentIds, event.currentTarget.getBoundingClientRect())}
              onMouseLeave={() => onHighlightHover(null, null)}
              onClick={(event) => onHighlightOpen(segment.commentIds, event.currentTarget.getBoundingClientRect())}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onHighlightOpen(segment.commentIds, event.currentTarget.getBoundingClientRect())
                }
              }}
            >
              {segment.text}
            </mark>
          ),
        )}
      </p>

      {showOriginal && hasOriginal && (
        <div className="mt-3 rounded-md border border-dashed border-border-strong bg-surface/70 p-3 text-sm text-foreground-secondary">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{t('original')}</p>
          <p className="whitespace-pre-wrap">{paragraph.originalText}</p>
        </div>
      )}

      <footer className="mt-3 flex flex-wrap items-center gap-2">
        {hasOriginal && (
          <button
            type="button"
            className="min-h-9 cursor-pointer rounded-md px-2 text-sm text-foreground-secondary underline-offset-4 hover:underline"
            onClick={() => setShowOriginal((v) => !v)}
            aria-expanded={showOriginal}
          >
            {showOriginal ? t('hideOriginal') : t('showOriginal')}
          </button>
        )}
        <span className="flex-1" />
        {role === 'reviewer' && (
          <ToggleButton
            pressed={paragraph.reviewed}
            disabled={busy}
            onClick={() => onToggle(paragraph.index, { reviewed: !paragraph.reviewed })}
            label={paragraph.reviewed ? t('unmarkReviewed') : t('markReviewed')}
            tone="success"
          />
        )}
      </footer>
    </article>
  )
})

function ToggleButton({
  pressed,
  disabled,
  onClick,
  label,
  tone,
}: {
  pressed: boolean
  disabled: boolean
  onClick: () => void
  label: string
  tone: 'success'
}) {
  const on = tone === 'success' ? 'border-success text-success' : ''
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-9 cursor-pointer items-center rounded-md border bg-surface px-3 text-sm font-semibold shadow-soft transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${
        pressed ? 'border-border-strong text-foreground-secondary' : on
      }`}
    >
      {label}
    </button>
  )
}
