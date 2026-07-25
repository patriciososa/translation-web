/**
 * Translation status portal payloads, mirroring api/src/portal/types.ts and
 * the PortalSnapshot served by GET /api/portal/me. Times are epoch millis.
 */

export type PortalRole = 'client' | 'translator' | 'reviewer'
export type PortalLocale = 'es' | 'en' | 'fr'
export type ParagraphState = 'translated' | 'reviewed'

export interface PortalParagraph {
  index: number
  originalText: string
  originalWords: number
  currentText: string
  present: boolean
  translated: boolean
  translatedAt: number | null
  translatedBy: string | null
  reviewed: boolean
  reviewedAt: number | null
  reviewedBy: string | null
}

export interface PortalProgress {
  totalWords: number
  translatedWords: number
  reviewedWords: number
}

export interface PortalComment {
  id: string
  paragraphIndex: number
  start: number
  end: number
  quote: string
  text: string
  authorAlias: string
  authorRole: PortalRole
  mine: boolean
  createdAt: number
  editedAt: number | null
  anchorStatus: 'ok' | 'changed'
  /** Null while open; set when the translator or reviewer marks it done. */
  resolvedAt: number | null
  resolvedByAlias: string | null
  resolvedByRole: PortalRole | null
  resolution: string | null
}

export type CommentEventKind = 'created' | 'edited' | 'deleted' | 'resolved' | 'reopened'

export type AuditAction =
  | 'comment.created'
  | 'comment.edited'
  | 'comment.deleted'
  | 'comment.resolved'
  | 'comment.reopened'
  | 'paragraph.translated'
  | 'paragraph.reviewed'
  /** The system cancelled a review because the paragraph's text changed. */
  | 'paragraph.review-cleared'

export interface PortalAuditEntry {
  id: string
  action: AuditAction
  target: { kind: 'comment'; id: string } | { kind: 'paragraph'; index: number }
  before: unknown
  after: unknown
  actorAlias: string
  actorRole: PortalRole | 'operator' | 'system'
  at: number
}

export interface PortalSnapshot {
  viewer: { role: PortalRole; alias: string; locale: PortalLocale }
  document: {
    id: string
    title: string
    lastSyncedAt: number
    syncError: boolean
    paragraphs: PortalParagraph[]
  }
  progress: PortalProgress
  comments: PortalComment[]
}

/** A paragraph in the Google Doc is translated text; the reviewer marks it reviewed. */
export function paragraphState(paragraph: PortalParagraph): ParagraphState {
  return paragraph.reviewed ? 'reviewed' : 'translated'
}
