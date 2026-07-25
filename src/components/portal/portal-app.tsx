'use client'

import { CircleAlert, FileText, Link2Off, Radio, RadioOff, RefreshCw } from 'lucide-react'
import { NextIntlClientProvider, useFormatter, useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { connectPortal, forgetToken, PortalApiError, PortalClient, takeToken } from '@/services/portal'
import type { LiveStatus } from '@/services/portal'
import type { PortalComment, PortalLocale, PortalParagraph, PortalSnapshot } from '@/types/portal'
import { CommentComposer } from './comment-composer'
import type { PendingSelection } from './comment-composer'
import { CommentPopover } from './comment-popover'
import type { CommentActions } from './comment-popover'
import { ParagraphCard } from './paragraph-card'
import { ProgressBar } from './progress-bar'
import { SidePanel } from './side-panel'
import { readSelection } from './text-ranges'

type PortalNamespace = (typeof import('../../../messages/en.json'))['portal']
export type PortalMessages = Record<PortalLocale, { portal: PortalNamespace }>

/** Before the link is verified, the browser's language decides; Spanish otherwise. */
function guessLocale(): PortalLocale {
  const lang = typeof navigator === 'undefined' ? '' : navigator.language.slice(0, 2)
  return lang === 'en' || lang === 'fr' ? lang : 'es'
}

type Phase =
  | { kind: 'loading' }
  | { kind: 'missing' }
  | { kind: 'invalid' }
  | { kind: 'unavailable' }
  | { kind: 'ready'; snapshot: PortalSnapshot }

/**
 * The translation status portal. Reads the link token (stripping it from the
 * URL), loads the document, then keeps it live over the /portal socket.
 */
async function fetchPhase(client: PortalClient): Promise<Phase> {
  try {
    return { kind: 'ready', snapshot: await client.snapshot() }
  } catch (error) {
    if (error instanceof PortalApiError && (error.status === 401 || error.status === 403 || error.status === 404)) {
      forgetToken()
      return { kind: 'invalid' }
    }
    return { kind: 'unavailable' }
  }
}

/**
 * The translation status portal. Reads the link token (stripping it from the
 * URL), loads the document, then keeps it live over the /portal socket.
 *
 * Rendered in the browser only (see portal-root.tsx): the token, the language
 * guess and the time zone are all browser facts, read once on mount.
 */
export function PortalApp({ messages }: { messages: PortalMessages }) {
  const [token] = useState<string | null>(() => takeToken())
  const [phase, setPhase] = useState<Phase>(() => (token === null ? { kind: 'missing' } : { kind: 'loading' }))
  const [timeZone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
  const [guessedLocale] = useState(guessLocale)
  const locale = phase.kind === 'ready' ? phase.snapshot.viewer.locale : guessedLocale

  const client = useMemo(() => (token === null ? null : new PortalClient(token)), [token])

  const apply = useCallback((next: Phase) => {
    // A failed refresh keeps the document already on screen.
    setPhase((current) => (next.kind === 'unavailable' && current.kind === 'ready' ? current : next))
  }, [])

  const load = useCallback(async () => {
    if (client !== null) apply(await fetchPhase(client))
  }, [client, apply])

  useEffect(() => {
    if (client !== null) void fetchPhase(client).then(apply)
  }, [client, apply])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // Stable, or the socket effect below would reconnect on every render.
  const onRevoked = useCallback(() => {
    forgetToken()
    setPhase({ kind: 'invalid' })
  }, [])

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone={timeZone}>
      <PortalTitle />
      {phase.kind === 'ready' && client !== null && token !== null ? (
        <PortalDocument
          token={token}
          client={client}
          initial={phase.snapshot}
          onRevoked={onRevoked}
          onResync={load}
        />
      ) : (
        <StatusScreen phase={phase.kind === 'ready' ? 'loading' : phase.kind} onRetry={() => void load()} />
      )}
    </NextIntlClientProvider>
  )
}

function PortalTitle() {
  const t = useTranslations('portal')
  useEffect(() => {
    document.title = `${t('metaTitle')} · Bluelab Translations`
  }, [t])
  return null
}

function StatusScreen({
  phase,
  onRetry,
}: {
  phase: 'loading' | 'missing' | 'invalid' | 'unavailable'
  onRetry: () => void
}) {
  const t = useTranslations('portal')
  if (phase === 'loading') {
    return (
      <main className="grid min-h-dvh place-items-center p-6">
        <Spinner label={t('loading')} />
      </main>
    )
  }
  const copy = {
    missing: { title: t('missingTitle'), body: t('missingBody'), Icon: FileText },
    invalid: { title: t('invalidTitle'), body: t('invalidBody'), Icon: Link2Off },
    unavailable: { title: t('unavailableTitle'), body: t('unavailableBody'), Icon: CircleAlert },
  }[phase]
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div className="max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-raised">
        <copy.Icon aria-hidden="true" className="mx-auto mb-4 size-10 text-muted" />
        <h1 className="mb-2 font-display text-xl font-semibold text-foreground">{copy.title}</h1>
        <p className="text-foreground-secondary">{copy.body}</p>
        {phase === 'unavailable' && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-primary px-5 font-semibold text-on-primary hover:bg-primary-hover"
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            {t('retry')}
          </button>
        )}
      </div>
    </main>
  )
}

function upsert(list: PortalComment[], comment: PortalComment): PortalComment[] {
  const at = list.findIndex((c) => c.id === comment.id)
  if (at === -1) return [...list, comment].sort((a, b) => a.paragraphIndex - b.paragraphIndex || a.start - b.start)
  const next = [...list]
  next[at] = comment
  return next
}

function mergeParagraphs(current: PortalParagraph[], changed: PortalParagraph[]): PortalParagraph[] {
  const byIndex = new Map(current.map((p) => [p.index, p]))
  for (const paragraph of changed) byIndex.set(paragraph.index, paragraph)
  return [...byIndex.values()].sort((a, b) => a.index - b.index)
}

const LIVE_LABEL = { connected: 'live', connecting: 'connecting', offline: 'offline' } as const

/** Green broadcast waves when live, yellow turning arrows while connecting, red crossed-out when offline. */
function LiveIcon({ status }: { status: LiveStatus }) {
  if (status === 'connected') return <Radio aria-hidden="true" className="size-3.5 text-success" />
  if (status === 'connecting') return <RefreshCw aria-hidden="true" className="size-3.5 animate-spin text-warning" />
  return <RadioOff aria-hidden="true" className="size-3.5 text-error" />
}

// Stable references for "nothing here", so memoised cards do not re-render.
const NO_COMMENTS: PortalComment[] = []
const NO_IDS: string[] = []

type Floating =
  | { kind: 'composer'; selection: PendingSelection }
  | { kind: 'cross'; rect: DOMRect }
  | { kind: 'open'; commentIds: string[]; rect: DOMRect }
  | null

function PortalDocument({
  token,
  client,
  initial,
  onRevoked,
  onResync,
}: {
  token: string
  client: PortalClient
  initial: PortalSnapshot
  onRevoked: () => void
  onResync: () => Promise<void>
}) {
  const t = useTranslations('portal')
  const format = useFormatter()
  const [snapshot, setSnapshot] = useState(initial)
  const [live, setLive] = useState<LiveStatus>('connecting')
  const [busyIndex, setBusyIndex] = useState<number | null>(null)
  const [floating, setFloating] = useState<Floating>(null)
  const [hover, setHover] = useState<{ commentIds: string[]; rect: DOMRect } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [historyVersion, setHistoryVersion] = useState(0)
  const firstConnect = useRef(true)

  // A fresh snapshot from the parent (after a reconnect) replaces ours,
  // adjusted during render rather than in an effect.
  const [seenInitial, setSeenInitial] = useState(initial)
  if (seenInitial !== initial) {
    setSeenInitial(initial)
    setSnapshot(initial)
  }

  const { document: doc, viewer, progress, comments } = snapshot
  const documentId = doc.id

  useEffect(() => {
    const bump = () => setHistoryVersion((v) => v + 1)
    return connectPortal(token, {
      onConnected: () => {
        // Events missed while disconnected are not replayed: catch up.
        if (!firstConnect.current) void onResync()
        firstConnect.current = false
      },
      onStatus: setLive,
      onParagraphs: ({ paragraphs, paragraphCount, progress, lastSyncedAt }) => {
        // A Google Doc read can cancel reviews, which the History records.
        if (paragraphs.length > 0) bump()
        setSnapshot((s) => ({
          ...s,
          progress,
          document: {
            ...s.document,
            lastSyncedAt,
            syncError: false,
            // Paragraphs removed from the Google Doc leave the portal.
            paragraphs: mergeParagraphs(s.document.paragraphs, paragraphs).filter((p) => p.index < paragraphCount),
          },
        }))
      },
      onDocument: ({ title, progress }) =>
        setSnapshot((s) => ({ ...s, progress, document: { ...s.document, title } })),
      onParagraphState: ({ paragraph, progress }) => {
        setSnapshot((s) => ({
          ...s,
          progress,
          document: { ...s.document, paragraphs: mergeParagraphs(s.document.paragraphs, [paragraph]) },
        }))
        bump()
      },
      onComment: ({ kind, comment }) => {
        setSnapshot((s) => ({
          ...s,
          comments: kind === 'deleted' ? s.comments.filter((c) => c.id !== comment.id) : upsert(s.comments, comment),
        }))
        bump()
      },
      onAnchors: ({ comments: moved }) =>
        setSnapshot((s) => ({ ...s, comments: moved.reduce(upsert, s.comments) })),
      onSyncError: ({ lastSyncedAt }) =>
        setSnapshot((s) => ({ ...s, document: { ...s.document, lastSyncedAt, syncError: true } })),
      onRevoked,
    })
  }, [token, onRevoked, onResync])

  // Selecting text inside a paragraph offers to comment on it.
  useEffect(() => {
    const onUp = (event: MouseEvent | KeyboardEvent) => {
      const target = event.target as Element | null
      if (target?.closest('[data-portal-floating]')) return
      window.setTimeout(() => {
        const result = readSelection()
        if (result.kind === 'range') {
          setFloating({ kind: 'composer', selection: result })
        } else if (result.kind === 'cross-paragraph') {
          const range = window.getSelection()?.getRangeAt(0)
          if (range) setFloating({ kind: 'cross', rect: range.getBoundingClientRect() })
        } else {
          setFloating((f) => (f?.kind === 'composer' || f?.kind === 'cross' ? null : f))
        }
      }, 0)
    }
    document.addEventListener('mouseup', onUp)
    document.addEventListener('keyup', onUp)
    document.addEventListener('touchend', onUp as unknown as EventListener)
    return () => {
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('keyup', onUp)
      document.removeEventListener('touchend', onUp as unknown as EventListener)
    }
  }, [])

  const report = (e: unknown) => setError(e instanceof Error ? e.message : String(e))

  // The three callbacks every ParagraphCard receives are stable, or its memo
  // would be defeated on each render.
  const toggle = useCallback(
    async (index: number, change: { reviewed: boolean }) => {
      setBusyIndex(index)
      try {
        const { paragraph, progress } = await client.setParagraphState(documentId, index, change)
        setSnapshot((s) => ({
          ...s,
          progress,
          document: { ...s.document, paragraphs: mergeParagraphs(s.document.paragraphs, [paragraph]) },
        }))
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setBusyIndex(null)
      }
    },
    [client, documentId],
  )

  const onHighlightHover = useCallback((ids: string[] | null, rect: DOMRect | null) => {
    setHover(ids && rect ? { commentIds: ids, rect } : null)
  }, [])

  const onHighlightOpen = useCallback((ids: string[], rect: DOMRect) => {
    setHover(null)
    setFloating({ kind: 'open', commentIds: ids, rect })
  }, [])

  async function createComment(selection: PendingSelection, text: string): Promise<boolean> {
    try {
      const comment = await client.createComment(documentId, {
        paragraphIndex: selection.paragraphIndex,
        start: selection.start,
        end: selection.end,
        quote: selection.quote,
        text,
      })
      setSnapshot((s) => ({ ...s, comments: upsert(s.comments, comment) }))
      window.getSelection()?.removeAllRanges()
      return true
    } catch (e) {
      report(e)
      return false
    }
  }

  async function editComment(comment: PortalComment, text: string): Promise<boolean> {
    try {
      const updated = await client.editComment(documentId, comment.id, text)
      setSnapshot((s) => ({ ...s, comments: upsert(s.comments, updated) }))
      return true
    } catch (e) {
      report(e)
      return false
    }
  }

  async function deleteComment(comment: PortalComment): Promise<boolean> {
    try {
      await client.deleteComment(documentId, comment.id)
      setSnapshot((s) => ({ ...s, comments: s.comments.filter((c) => c.id !== comment.id) }))
      return true
    } catch (e) {
      report(e)
      return false
    }
  }

  async function resolveComment(comment: PortalComment, resolution: string): Promise<boolean> {
    try {
      const updated = await client.resolveComment(documentId, comment.id, resolution)
      setSnapshot((s) => ({ ...s, comments: upsert(s.comments, updated) }))
      return true
    } catch (e) {
      report(e)
      return false
    }
  }

  async function reopenComment(comment: PortalComment): Promise<boolean> {
    try {
      const updated = await client.reopenComment(documentId, comment.id)
      setSnapshot((s) => ({ ...s, comments: upsert(s.comments, updated) }))
      return true
    } catch (e) {
      report(e)
      return false
    }
  }

  const actions: CommentActions = {
    role: viewer.role,
    onEdit: editComment,
    onDelete: deleteComment,
    onResolve: resolveComment,
    onReopen: reopenComment,
  }

  function jumpTo(comment: PortalComment, rowRect: DOMRect) {
    const card = document.getElementById(`paragraph-${comment.paragraphIndex}`)
    if (card === null) {
      // Its paragraph was removed from the Google Doc: open it beside its row
      // in the list, with the same actions, rather than not at all.
      setFloating({ kind: 'open', commentIds: [comment.id], rect: rowRect })
      return
    }
    card.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Open on the highlight once it has scrolled into place.
    window.setTimeout(() => {
      // Resolved comments have no highlight: anchor on the paragraph card.
      const marks = comment.resolvedAt === null ? card.querySelectorAll('mark') : []
      const target = [...marks].find((m) => m.textContent !== null && comment.quote.includes(m.textContent))
      setFloating({ kind: 'open', commentIds: [comment.id], rect: (target ?? card).getBoundingClientRect() })
    }, 450)
  }

  // Open comments only: resolved ones are not highlighted or counted on their paragraph.
  const commentsByParagraph = useMemo(() => {
    const map = new Map<number, PortalComment[]>()
    for (const c of comments) if (c.resolvedAt === null) map.set(c.paragraphIndex, [...(map.get(c.paragraphIndex) ?? []), c])
    return map
  }, [comments])

  const pick = (ids: string[]) => comments.filter((c) => ids.includes(c.id))
  const openComments = floating?.kind === 'open' ? pick(floating.commentIds) : []
  const time = (ms: number) => format.dateTime(new Date(ms), { dateStyle: 'short', timeStyle: 'short' })
  const closeFloating = useCallback(() => setFloating(null), [])
  const activeIds = floating?.kind === 'open' ? floating.commentIds : NO_IDS

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Bluelab Translations</p>
              <h1 className="truncate font-display text-xl font-semibold text-foreground sm:text-2xl">{doc.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-secondary">
              <span>{t('viewingAs', { alias: viewer.alias, role: t(`role.${viewer.role}`) })}</span>
              <span className="inline-flex items-center gap-1.5 text-foreground-secondary" aria-live="polite">
                <LiveIcon status={live} />
                {t(LIVE_LABEL[live])}
              </span>
            </div>
          </div>
          <ProgressBar progress={progress} />
          <p className="mt-2 text-xs text-muted" aria-live="polite">
            {doc.syncError ? (
              <span className="text-warning">{t('syncError', { time: time(doc.lastSyncedAt) })}</span>
            ) : (
              t('lastUpdated', { time: time(doc.lastSyncedAt) })
            )}
          </p>
        </div>
      </header>

      {error !== null && (
        <div role="alert" className="mx-auto mt-4 flex max-w-6xl items-center gap-3 px-4 sm:px-6">
          <p className="flex-1 rounded-md bg-error/10 px-3 py-2 text-sm text-error">{t('actionFailed', { message: error })}</p>
          <button type="button" className="cursor-pointer text-sm text-muted underline" onClick={() => setError(null)}>
            {t('dismiss')}
          </button>
        </div>
      )}

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-3">
          {doc.paragraphs.map((paragraph) => {
            const own = commentsByParagraph.get(paragraph.index) ?? NO_COMMENTS
            return (
              <ParagraphCard
                key={paragraph.index}
                paragraph={paragraph}
                comments={own}
                role={viewer.role}
                busy={busyIndex === paragraph.index}
                // Only the paragraph the open popover belongs to is told about it.
                activeCommentIds={own.some((c) => activeIds.includes(c.id)) ? activeIds : NO_IDS}
                onToggle={toggle}
                onHighlightHover={onHighlightHover}
                onHighlightOpen={onHighlightOpen}
              />
            )
          })}
        </section>
        <div className="lg:sticky lg:top-44 lg:self-start">
          <SidePanel
            comments={comments}
            client={client}
            documentId={documentId}
            historyVersion={historyVersion}
            onJump={jumpTo}
          />
        </div>
      </main>

      <div data-portal-floating>
        {hover !== null && floating?.kind !== 'open' && (
          <CommentPopover
            preview
            comments={pick(hover.commentIds)}
            rect={hover.rect}
            onClose={() => setHover(null)}
            actions={actions}
          />
        )}
        {floating?.kind === 'open' && openComments.length > 0 && (
          <CommentPopover
            comments={openComments}
            rect={floating.rect}
            onClose={closeFloating}
            actions={actions}
          />
        )}
        {floating?.kind === 'composer' && (
          <CommentComposer
            key={`${floating.selection.paragraphIndex}:${floating.selection.start}:${floating.selection.end}`}
            selection={floating.selection}
            onSubmit={(text) => createComment(floating.selection, text)}
            onCancel={closeFloating}
          />
        )}
        {floating?.kind === 'cross' && (
          <div
            role="status"
            style={{ position: 'fixed', left: Math.max(8, floating.rect.left), top: floating.rect.bottom + 8, maxWidth: 340 }}
            className="z-40 rounded-md border border-warning/40 bg-surface p-3 text-sm text-warning shadow-raised"
          >
            {t('selectWithinParagraph')}
          </div>
        )}
      </div>
    </div>
  )
}
