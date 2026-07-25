'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PortalClient } from '@/services/portal'
import type { PortalAuditEntry, PortalComment } from '@/types/portal'
import { SmallButton } from './comment-popover'

/** Comments list and History view, as two tabs beside (or below) the document. */
export function SidePanel({
  comments,
  client,
  documentId,
  historyVersion,
  onJump,
}: {
  comments: PortalComment[]
  client: PortalClient
  documentId: string
  /** Bumped on every live change, so an open History tab refreshes. */
  historyVersion: number
  /** `rowRect`: where the row is, for comments whose paragraph is gone. */
  onJump: (comment: PortalComment, rowRect: DOMRect) => void
}) {
  const t = useTranslations('portal')
  const [tab, setTab] = useState<'comments' | 'history'>('comments')

  return (
    <aside className="rounded-lg border border-border bg-surface shadow-soft">
      <div role="tablist" className="flex border-b border-border">
        {(['comments', 'history'] as const).map((id) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`min-h-11 flex-1 cursor-pointer border-b-2 px-3 text-sm font-semibold transition-colors ${
              tab === id ? 'border-primary text-foreground' : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {id === 'comments' ? t('tabComments', { count: comments.filter((c) => c.resolvedAt === null).length }) : t('tabHistory')}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="max-h-[70vh] overflow-y-auto p-3">
        {tab === 'comments' ? (
          <CommentsList comments={comments} onJump={onJump} />
        ) : (
          <HistoryList client={client} documentId={documentId} version={historyVersion} />
        )}
      </div>
    </aside>
  )
}

function CommentsList({ comments, onJump }: { comments: PortalComment[]; onJump: (c: PortalComment, rowRect: DOMRect) => void }) {
  const t = useTranslations('portal')
  if (comments.length === 0) return <p className="p-2 text-sm text-muted">{t('noComments')}</p>
  const open = comments.filter((c) => c.resolvedAt === null)
  const resolved = comments.filter((c) => c.resolvedAt !== null)
  return (
    <div>
      {open.length === 0 ? (
        <p className="p-2 text-sm text-muted">{t('openCount', { count: 0 })}</p>
      ) : (
        <ul className="space-y-1">
          {open.map((comment) => (
            <CommentRow key={comment.id} comment={comment} onJump={onJump} />
          ))}
        </ul>
      )}
      {resolved.length > 0 && (
        <details className="mt-3 border-t border-border pt-2">
          <summary className="cursor-pointer select-none p-2 text-sm font-semibold text-success">
            {t('resolvedGroup', { count: resolved.length })}
          </summary>
          <ul className="space-y-1 opacity-80">
            {resolved.map((comment) => (
              <CommentRow key={comment.id} comment={comment} onJump={onJump} />
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

function CommentRow({ comment, onJump }: { comment: PortalComment; onJump: (c: PortalComment, rowRect: DOMRect) => void }) {
  const t = useTranslations('portal')
  const resolved = comment.resolvedAt !== null
  return (
    <li>
      <button
        type="button"
        onClick={(event) => onJump(comment, event.currentTarget.getBoundingClientRect())}
        className="w-full cursor-pointer rounded-md p-2 text-left text-sm transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-primary"
      >
        <span className="mb-0.5 flex flex-wrap items-baseline gap-x-2 text-xs text-muted">
          <span className="font-semibold text-foreground">{comment.authorAlias}</span>
          {t('paragraphLabel', { number: comment.paragraphIndex + 1 })}
          {resolved ? (
            <span className="text-success">· {t('resolved')}</span>
          ) : (
            comment.anchorStatus === 'changed' && <span className="text-warning">· {t('textChanged')}</span>
          )}
        </span>
        <span className="block truncate border-l-2 border-accent pl-2 text-xs italic text-foreground-secondary">
          {comment.quote}
        </span>
        <span className={`mt-0.5 line-clamp-2 block text-foreground ${resolved ? 'line-through decoration-muted/60' : ''}`}>
          {comment.text}
        </span>
      </button>
    </li>
  )
}

/** Live changes arrive in bursts (a Google Doc sync touches many paragraphs): one refresh per burst. */
const HISTORY_REFRESH_DEBOUNCE_MS = 400

interface HistoryPages {
  entries: PortalAuditEntry[]
  /** Cursor for the page after the oldest entry shown; null when there is none. */
  next: number | null
}

/**
 * Folds a freshly fetched first page into what is already shown, so a live
 * change does not throw away the older pages the reader loaded with "load
 * more". If the fresh page shares nothing with the list (more than a page of
 * changes arrived at once) the list restarts from it rather than show a gap.
 */
function mergeFirstPage(shown: HistoryPages, page: HistoryPages): HistoryPages {
  const fresh = new Set(page.entries.map((entry) => entry.id))
  const overlaps = shown.entries.some((entry) => fresh.has(entry.id))
  if (!overlaps) return page
  return {
    entries: [...page.entries, ...shown.entries.filter((entry) => !fresh.has(entry.id))],
    next: shown.next,
  }
}

function HistoryList({ client, documentId, version }: { client: PortalClient; documentId: string; version: number }) {
  const t = useTranslations('portal')
  const format = useFormatter()
  const [{ entries, next }, setHistory] = useState<HistoryPages>({ entries: [], next: null })
  const [loading, setLoading] = useState(true)
  const loadedOnce = useRef(false)

  const more = useCallback(
    async (before: number) => {
      setLoading(true)
      try {
        const page = await client.audit(documentId, before)
        setHistory((shown) => {
          const known = new Set(shown.entries.map((entry) => entry.id))
          return {
            entries: [...shown.entries, ...page.entries.filter((entry) => !known.has(entry.id))],
            next: page.next,
          }
        })
      } catch {
        // Leave what is shown; the button stays for another try.
      } finally {
        setLoading(false)
      }
    },
    [client, documentId],
  )

  // First page at once; again, debounced, after live changes (`version`).
  useEffect(() => {
    let current = true
    const timer = window.setTimeout(
      () => {
        client
          .audit(documentId, null)
          .then((page) => {
            if (!current) return
            loadedOnce.current = true
            setHistory((shown) => mergeFirstPage(shown, page))
          })
          .catch(() => undefined)
          .finally(() => current && setLoading(false))
      },
      loadedOnce.current ? HISTORY_REFRESH_DEBOUNCE_MS : 0,
    )
    return () => {
      current = false
      window.clearTimeout(timer)
    }
  }, [client, documentId, version])

  if (!loading && entries.length === 0) return <p className="p-2 text-sm text-muted">{t('noHistory')}</p>
  return (
    <div>
      <ol className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-md p-2 text-sm">
            <p className="text-foreground">
              {entry.actorRole === 'system' ? (
                <span className="font-semibold">{t('actorSystem')}</span>
              ) : (
                <>
                  <span className="font-semibold">{entry.actorAlias}</span>{' '}
                  <span className="text-xs text-muted">
                    ({entry.actorRole === 'operator' ? 'operator' : t(`role.${entry.actorRole}`)})
                  </span>
                </>
              )}{' '}
              {describe(entry, t)}
            </p>
            <AuditDetail entry={entry} />
            <p className="text-xs text-muted">
              {format.dateTime(new Date(entry.at), { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </li>
        ))}
      </ol>
      {next !== null && (
        <div className="mt-2 text-center">
          <SmallButton disabled={loading} onClick={() => void more(next)}>
            {t('loadMore')}
          </SmallButton>
        </div>
      )}
    </div>
  )
}

const AUDIT_KEYS = {
  'comment.created': 'commentCreated',
  'comment.edited': 'commentEdited',
  'comment.deleted': 'commentDeleted',
  'comment.resolved': 'commentResolved',
  'comment.reopened': 'commentReopened',
} as const

function describe(entry: PortalAuditEntry, t: ReturnType<typeof useTranslations<'portal'>>): string {
  if (entry.target.kind === 'paragraph') {
    if (entry.action === 'paragraph.review-cleared') {
      return t('audit.reviewCleared', { number: entry.target.index + 1 })
    }
    const on = entry.after === true
    const key =
      entry.action === 'paragraph.reviewed'
        ? on ? 'reviewedOn' : 'reviewedOff'
        : on ? 'translatedOn' : 'translatedOff'
    return t(`audit.${key}`, { number: entry.target.index + 1 })
  }
  // Message keys cannot contain dots (next-intl reads them as nesting).
  return t(`audit.${AUDIT_KEYS[entry.action as keyof typeof AUDIT_KEYS]}`)
}

/** The comment text involved (before → after for an edit). */
function AuditDetail({ entry }: { entry: PortalAuditEntry }) {
  const field = (value: unknown, key: 'text' | 'resolution'): string | null =>
    typeof value === 'object' && value !== null && typeof (value as Record<string, unknown>)[key] === 'string'
      ? ((value as Record<string, unknown>)[key] as string)
      : null
  // A resolution shows its reply; a reopening, the reply it undid.
  if (entry.action === 'comment.resolved' || entry.action === 'comment.reopened') {
    const reply = field(entry.action === 'comment.resolved' ? entry.after : entry.before, 'resolution')
    const quote = field(entry.before, 'text')
    if (reply === null && quote === null) return null
    return (
      <p className="my-0.5 line-clamp-3 border-l-2 border-success/50 pl-2 text-xs text-foreground-secondary">
        {quote !== null && <span className="italic">{quote}</span>}
        {quote !== null && reply !== null && ' → '}
        {reply}
      </p>
    )
  }
  const before = field(entry.before, 'text')
  const after = field(entry.after, 'text')
  if (before === null && after === null) return null
  return (
    <p className="my-0.5 line-clamp-3 border-l-2 border-border-strong pl-2 text-xs text-foreground-secondary">
      {before !== null && after !== null ? (
        <>
          <span className="line-through">{before}</span> → {after}
        </>
      ) : (
        (after ?? before)
      )}
    </p>
  )
}
