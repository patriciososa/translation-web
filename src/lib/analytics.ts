import { sendGAEvent } from '@next/third-parties/google'

/**
 * Google Analytics custom events. No-ops when NEXT_PUBLIC_GA_MEASUREMENT_ID
 * is unset (development builds), matching the layout's <GoogleAnalytics> gate.
 */
const GA_ENABLED = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)

/**
 * Fallback values for the 10 registered GA4 custom dimensions. Every event
 * fills all of them so none of our own events land in GA4's "(not set)" bucket
 * for any dimension; explicit params passed to trackEvent override these.
 *
 * Note: this cannot cover GA's automatic events (page_view, session_start,
 * scroll, user_engagement, first_visit), which never pass through this code —
 * exclude "(not set)" or scope to specific event names in the report instead.
 */
const DIMENSION_DEFAULTS: Record<string, string> = {
  link_id: 'none',
  section: 'other',
  location: 'none',
  action: 'none',
  href: 'none',
  from_locale: 'none',
  to_locale: 'none',
  service_id: 'none',
  faq_id: 'none',
  topic: 'none',
}

export function trackEvent(name: string, params: Record<string, string> = {}): void {
  if (!GA_ENABLED) return
  // Default link_id to the event name (more useful than a bare "none" for
  // events that don't name a specific control), then let explicit params win.
  sendGAEvent('event', name, { ...DIMENSION_DEFAULTS, link_id: name, ...params })
}
