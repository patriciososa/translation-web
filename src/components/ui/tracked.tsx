'use client'

import Link from 'next/link'
import type { ComponentProps, MouseEvent } from 'react'
import { Link as LocaleLink } from '@/i18n/navigation'
import { trackEvent } from '@/lib/analytics'

/**
 * Interactive elements that report a Google Analytics event when used.
 * Server components render these instead of the raw equivalents, since
 * they cannot attach click handlers themselves.
 */
interface TrackProps {
  /** GA4 event name sent on interaction. */
  event: string
  /** Extra GA4 event parameters. */
  eventParams?: Record<string, string>
}

/**
 * Scroll to a same-page anchor the router would otherwise ignore.
 *
 * Clicking a link that points at the URL you are already on is a no-op for the
 * router: same href, no navigation, nothing scrolls. In the footer that is the
 * common case rather than the edge one — the Services, Industries, and
 * Languages columns each point every one of their links at a single section —
 * so once you had followed one of them, every other link in the column looked
 * dead. This does what a plain `<a href="#x">` does and scrolls there itself.
 *
 * Only unmodified left clicks are taken, so opening in a new tab still works,
 * and `scrollIntoView` is called bare on purpose: with no arguments it honours
 * the page's `scroll-behavior` and the sections' `scroll-margin-top`.
 */
function scrollToCurrentHash(href: string, mouseEvent: MouseEvent<HTMLAnchorElement>): void {
  if (mouseEvent.defaultPrevented || mouseEvent.button !== 0) return
  if (mouseEvent.metaKey || mouseEvent.ctrlKey || mouseEvent.shiftKey || mouseEvent.altKey) return

  const hashAt = href.indexOf('#')
  if (hashAt === -1) return
  const samePath = (a: string, b: string) => (a.replace(/\/+$/, '') || '/') === (b.replace(/\/+$/, '') || '/')
  const hash = href.slice(hashAt)
  if (!samePath(href.slice(0, hashAt) || '/', window.location.pathname)) return
  if (window.location.hash !== hash) return

  const target = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (!target) return
  mouseEvent.preventDefault()
  target.scrollIntoView()
}

/** next/link that reports a GA event on click. */
export function TrackedLink({
  event,
  eventParams,
  onClick,
  ...props
}: TrackProps & ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(mouseEvent) => {
        trackEvent(event, { href: String(props.href), ...eventParams })
        onClick?.(mouseEvent)
        scrollToCurrentHash(String(props.href), mouseEvent)
      }}
    />
  )
}

/** Locale-aware link that reports a GA event on click. */
export function TrackedLocaleLink({
  event,
  eventParams,
  onClick,
  ...props
}: TrackProps & ComponentProps<typeof LocaleLink>) {
  return (
    <LocaleLink
      {...props}
      onClick={(mouseEvent) => {
        trackEvent(event, { href: String(props.href), ...eventParams })
        onClick?.(mouseEvent)
      }}
    />
  )
}

/** Plain anchor (mailto, downloads, external URLs) that reports a GA event on click. */
export function TrackedAnchor({
  event,
  eventParams,
  onClick,
  ...props
}: TrackProps & ComponentProps<'a'>) {
  return (
    <a
      {...props}
      onClick={(mouseEvent) => {
        trackEvent(event, { href: props.href ?? '', ...eventParams })
        onClick?.(mouseEvent)
      }}
    />
  )
}

/** details element that reports a GA event with an open/close action on toggle. */
export function TrackedDetails({
  event,
  eventParams,
  ...props
}: TrackProps & ComponentProps<'details'>) {
  return (
    <details
      {...props}
      onToggle={(toggleEvent) => {
        trackEvent(event, {
          action: toggleEvent.currentTarget.open ? 'open' : 'close',
          ...eventParams,
        })
      }}
    />
  )
}
