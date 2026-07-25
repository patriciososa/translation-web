import { sendGAEvent } from '@next/third-parties/google'
import { GA_DIMENSION_DEFAULTS } from './ga-dimensions'

/**
 * Google Analytics custom events. No-ops when NEXT_PUBLIC_GA_MEASUREMENT_ID
 * is unset (development builds), matching the layout's <GoogleAnalytics> gate.
 */
const GA_ENABLED = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)

export function trackEvent(name: string, params: Record<string, string> = {}): void {
  if (!GA_ENABLED) return
  // The dimension defaults are already seeded globally in the layout, so this
  // spread is only belt-and-braces — except for link_id, which defaults to the
  // event name here (more useful than a bare "none" for events that don't name
  // a specific control). Explicit params always win.
  sendGAEvent('event', name, { ...GA_DIMENSION_DEFAULTS, link_id: name, ...params })
}
