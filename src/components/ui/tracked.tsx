'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
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
