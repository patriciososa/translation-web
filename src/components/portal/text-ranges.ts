import type { PortalComment } from '@/types/portal'

/** Mirrors the backend limit (api/src/portal/portal-service.ts). */
export const MAX_COMMENT_LENGTH = 2000

export interface TextSegment {
  start: number
  end: number
  text: string
  /** Comments covering this stretch; empty for plain text. */
  commentIds: string[]
}

/**
 * Cuts a paragraph at every comment boundary so overlapping ranges render as
 * adjacent segments, each knowing every comment that covers it. Comments whose
 * text is gone (`anchorStatus: 'changed'`) or out of bounds get no highlight.
 */
export function segmentText(text: string, comments: PortalComment[]): TextSegment[] {
  const anchored = comments.filter(
    (c) => c.anchorStatus === 'ok' && c.start >= 0 && c.end <= text.length && c.end > c.start,
  )
  const cuts = new Set<number>([0, text.length])
  for (const c of anchored) {
    cuts.add(c.start)
    cuts.add(c.end)
  }
  const points = [...cuts].sort((a, b) => a - b)
  const segments: TextSegment[] = []
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]!
    const end = points[i + 1]!
    if (end <= start) continue
    segments.push({
      start,
      end,
      text: text.slice(start, end),
      commentIds: anchored.filter((c) => c.start <= start && c.end >= end).map((c) => c.id),
    })
  }
  return segments
}

/** Character offset of a DOM position within `root`'s text content. */
function offsetWithin(root: Node, node: Node, offset: number): number {
  const range = document.createRange()
  range.selectNodeContents(root)
  range.setEnd(node, offset)
  return range.toString().length
}

export type SelectionResult =
  | { kind: 'none' }
  | { kind: 'cross-paragraph' }
  | { kind: 'range'; paragraphIndex: number; start: number; end: number; quote: string; rect: DOMRect }

/**
 * Reads the current selection as a range inside one paragraph's text, whose
 * element carries `data-paragraph-text="<index>"`. Leading and trailing
 * whitespace is trimmed off the range, so a double-clicked word is the word.
 */
export function readSelection(): SelectionResult {
  const selection = window.getSelection()
  if (selection === null || selection.rangeCount === 0 || selection.isCollapsed) return { kind: 'none' }
  const range = selection.getRangeAt(0)
  const element = (node: Node): Element | null => (node instanceof Element ? node : node.parentElement)
  const startRoot = element(range.startContainer)?.closest('[data-paragraph-text]') ?? null
  const endRoot = element(range.endContainer)?.closest('[data-paragraph-text]') ?? null
  if (startRoot === null && endRoot === null) return { kind: 'none' }
  if (startRoot === null || endRoot === null || startRoot !== endRoot) return { kind: 'cross-paragraph' }

  const text = startRoot.textContent ?? ''
  let start = offsetWithin(startRoot, range.startContainer, range.startOffset)
  let end = offsetWithin(startRoot, range.endContainer, range.endOffset)
  while (start < end && /\s/.test(text[start] ?? '')) start++
  while (end > start && /\s/.test(text[end - 1] ?? '')) end--
  if (end <= start) return { kind: 'none' }

  return {
    kind: 'range',
    paragraphIndex: Number(startRoot.getAttribute('data-paragraph-text')),
    start,
    end,
    quote: text.slice(start, end),
    rect: range.getBoundingClientRect(),
  }
}
