/**
 * Fallback values for the 10 registered GA4 custom dimensions.
 *
 * These are seeded globally with a `gtag('set', …)` queued *before* the
 * measurement script's own `config` call (see the root layout), which is what
 * keeps GA's automatic events — page_view, session_start, first_visit, scroll,
 * user_engagement — out of the "(not set)" bucket: those never pass through
 * `trackEvent`, so a per-event default cannot reach them. Ordering is the whole
 * trick; a `set` issued after `config` misses the first page_view of the
 * session, which is the one that matters.
 *
 * Kept free of imports so both the server-rendered layout and the client
 * analytics module can read the same list.
 */
export const GA_DIMENSION_DEFAULTS: Record<string, string> = {
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
