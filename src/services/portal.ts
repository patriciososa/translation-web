import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { API_BASE_URL } from './api'
import type {
  CommentEventKind,
  PortalAuditEntry,
  PortalComment,
  PortalParagraph,
  PortalProgress,
  PortalSnapshot,
} from '@/types/portal'

/**
 * Translation status portal: the link token, the REST calls and the live
 * /portal socket. Components never touch fetch or the socket directly.
 *
 * The token arrives in the link's fragment, `/portal#token=…`. A fragment is
 * the one part of a URL the browser keeps to itself: it is in no request, so
 * the link secret reaches neither this server nor its access log. Links issued
 * before 2026-11-10 carry it as `?token=` instead — those did land in the log
 * — and keep working until they expire.
 *
 * Either way it is moved into sessionStorage and stripped from the address bar
 * before anything else runs, so it never reaches the browser history entry, a
 * bookmark, a screenshot or a Referer. sessionStorage is per tab: an operator
 * can hold the client, translator and reviewer links in three tabs side by
 * side.
 */
const STORAGE_KEY = 'portal-token'

export function takeToken(): string | null {
  const url = new URL(window.location.href)
  const fragment = new URLSearchParams(url.hash.slice(1))
  const fromUrl = fragment.get('token') || url.searchParams.get('token')
  if (fromUrl !== null && fromUrl !== '') {
    try {
      sessionStorage.setItem(STORAGE_KEY, fromUrl)
    } catch {
      // Storage blocked (private mode on some browsers): the token still works
      // for this page view, it just will not survive a reload.
    }
    url.searchParams.delete('token')
    fragment.delete('token')
    const hash = fragment.toString()
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${hash === '' ? '' : `#${hash}`}`,
    )
    return fromUrl
  }
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function forgetToken(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing stored, nothing to forget.
  }
}

/** A failed call, with the backend's status and its user-facing message. */
export class PortalApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'PortalApiError'
  }
}

export class PortalClient {
  constructor(private readonly token: string) {}

  private async call<T>(path: string, init: RequestInit = {}): Promise<T> {
    let response: Response
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
          authorization: `Bearer ${this.token}`,
          ...(init.body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
      })
    } catch {
      throw new PortalApiError(0, 'The server could not be reached.')
    }
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    if (!response.ok) throw new PortalApiError(response.status, body.error ?? `Error ${response.status}`)
    return body as T
  }

  snapshot(): Promise<PortalSnapshot> {
    return this.call('/api/portal/me')
  }

  setParagraphState(
    documentId: string,
    index: number,
    change: { reviewed: boolean },
  ): Promise<{ paragraph: PortalParagraph; progress: PortalProgress }> {
    return this.call(`/api/portal/documents/${documentId}/paragraphs/${index}`, {
      method: 'PATCH',
      body: JSON.stringify(change),
    })
  }

  async createComment(
    documentId: string,
    input: { paragraphIndex: number; start: number; end: number; quote: string; text: string },
  ): Promise<PortalComment> {
    const { comment } = await this.call<{ comment: PortalComment }>(`/api/portal/documents/${documentId}/comments`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return comment
  }

  async editComment(documentId: string, commentId: string, text: string): Promise<PortalComment> {
    const { comment } = await this.call<{ comment: PortalComment }>(
      `/api/portal/documents/${documentId}/comments/${commentId}`,
      { method: 'PATCH', body: JSON.stringify({ text }) },
    )
    return comment
  }

  async resolveComment(documentId: string, commentId: string, resolution: string): Promise<PortalComment> {
    const { comment } = await this.call<{ comment: PortalComment }>(
      `/api/portal/documents/${documentId}/comments/${commentId}/resolve`,
      { method: 'POST', body: JSON.stringify(resolution.trim() === '' ? {} : { resolution }) },
    )
    return comment
  }

  async reopenComment(documentId: string, commentId: string): Promise<PortalComment> {
    const { comment } = await this.call<{ comment: PortalComment }>(
      `/api/portal/documents/${documentId}/comments/${commentId}/reopen`,
      { method: 'POST', body: '{}' },
    )
    return comment
  }

  async deleteComment(documentId: string, commentId: string): Promise<void> {
    await this.call(`/api/portal/documents/${documentId}/comments/${commentId}`, { method: 'DELETE' })
  }

  audit(documentId: string, before: number | null): Promise<{ entries: PortalAuditEntry[]; next: number | null }> {
    const query = before === null ? '' : `?before=${before}`
    return this.call(`/api/portal/documents/${documentId}/audit${query}`)
  }
}

export interface PortalEventHandlers {
  onParagraphs: (payload: {
    paragraphs: PortalParagraph[]
    paragraphCount: number
    progress: PortalProgress
    lastSyncedAt: number
  }) => void
  onDocument: (payload: { title: string; progress: PortalProgress }) => void
  onParagraphState: (payload: { paragraph: PortalParagraph; progress: PortalProgress }) => void
  onComment: (payload: { kind: CommentEventKind; comment: PortalComment }) => void
  onAnchors: (payload: { comments: PortalComment[] }) => void
  onSyncError: (payload: { lastSyncedAt: number }) => void
  onRevoked: () => void
  /** Connected (again): the caller refetches the snapshot to catch up. */
  onConnected: () => void
  /** Live-link state for the header indicator. */
  onStatus: (status: LiveStatus) => void
}

/**
 * connected: updates are flowing. connecting: opening or recovering after a
 * drop. offline: the browser has no network, or several attempts in a row
 * failed — Socket.IO keeps retrying, and the first success flips it back.
 */
export type LiveStatus = 'connected' | 'connecting' | 'offline'

/** Consecutive failed attempts after which the link counts as offline. */
const OFFLINE_AFTER_FAILURES = 3

/**
 * Listen-only socket on /portal. The token goes in the handshake auth payload,
 * never in the URL; the server picks the document room from it.
 */
export function connectPortal(token: string, handlers: PortalEventHandlers): () => void {
  const socket: Socket = io(`${API_BASE_URL}/portal`, {
    auth: { token },
    transports: ['websocket', 'polling'],
  })
  let failures = 0
  const browserOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false
  const report = () => handlers.onStatus(browserOffline() || failures >= OFFLINE_AFTER_FAILURES ? 'offline' : 'connecting')
  handlers.onStatus(browserOffline() ? 'offline' : 'connecting')

  socket.on('connect', () => {
    failures = 0
    handlers.onStatus('connected')
    handlers.onConnected()
  })
  socket.on('disconnect', report)
  socket.on('connect_error', () => {
    failures++
    report()
  })
  const onOffline = () => handlers.onStatus('offline')
  const onOnline = () => {
    failures = 0
    if (socket.connected) handlers.onStatus('connected')
    else {
      handlers.onStatus('connecting')
      socket.connect()
    }
  }
  window.addEventListener('offline', onOffline)
  window.addEventListener('online', onOnline)
  socket.on('portal:paragraphs', handlers.onParagraphs)
  socket.on('portal:document', handlers.onDocument)
  socket.on('portal:paragraph-state', handlers.onParagraphState)
  socket.on('portal:comment', handlers.onComment)
  socket.on('portal:anchors', handlers.onAnchors)
  socket.on('portal:sync-error', handlers.onSyncError)
  socket.on('portal:revoked', handlers.onRevoked)
  return () => {
    window.removeEventListener('offline', onOffline)
    window.removeEventListener('online', onOnline)
    socket.removeAllListeners()
    socket.disconnect()
  }
}
