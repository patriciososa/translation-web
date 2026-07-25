import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'
import { isValidSessionToken, SESSION_COOKIE, signSessionToken } from '@/lib/jwt'

const handleI18nRouting = createMiddleware(routing)

/**
 * English slugs that were unprefixed URLs until Spanish became the default
 * locale on 2026-08-10 — they are what Google indexed and what the English ad
 * groups still use as their final URL.
 *
 * next-intl answers them, but canonicalises an unprefixed path to the default
 * locale, so `/certified-translation` 307s to `/traduccion-certificada` and
 * lands an English visitor on Spanish copy. Handled here rather than in
 * next.config's `redirects()` so the rule sits with the locale routing that
 * creates the need, and is derived from `pathnames` instead of restating it.
 *
 * Only slugs that differ from the Spanish one identify English. Where every
 * locale shares a slug ('/') an unprefixed request is Spanish by definition
 * and there is nothing to disambiguate.
 */
const LEGACY_ENGLISH_PATHS = new Set(
  Object.values(routing.pathnames)
    .filter((paths) => typeof paths === 'object')
    .map((paths) => paths as Record<string, string>)
    .filter((paths) => paths.en !== paths.es)
    .map((paths) => paths.en),
)

/**
 * Slugs that were renamed after they were already indexed and already set as
 * an ad group's final URL. Keys are the retired path, values the live one.
 *
 * Both sides carry the locale prefix the URL actually has, because these are
 * matched against the raw request path before next-intl sees it: Spanish is
 * the default locale and so is unprefixed, French is not.
 *
 * Unlike LEGACY_ENGLISH_PATHS these cannot be derived from `pathnames` — the
 * old slug is gone from it by definition — so each entry has to be written
 * down, and stays for as long as the old URL keeps receiving traffic.
 */
const RENAMED_PATHS: Record<string, string> = {
  // 'jurídica' -> 'legal' across the site's headings, 2026-08-18.
  '/traduccion-juridica': '/traduccion-legal',
  // Careers page renamed 'Travailler avec nous' -> 'Rejoignez-nous', 2026-08-29.
  '/fr/travailler-avec-nous': '/fr/rejoignez-nous',
}

/**
 * Two request-time concerns share this proxy:
 * 1. Locale routing (next-intl): redirects/rewrites the request onto the
 *    right locale segment. Its response is used as the base so redirects
 *    survive.
 * 2. Session bootstrap: ensures every visitor has a valid session JWT in an
 *    HttpOnly cookie before the page loads. The token is created only on the
 *    server and is the single source of truth for the chat session.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  // Permanent, so the index moves to the /en URLs. No session cookie is set on
  // the way past; the redirected request picks one up.
  const path = request.nextUrl.pathname.replace(/\/$/, '')
  if (LEGACY_ENGLISH_PATHS.has(path)) {
    const target = request.nextUrl.clone()
    target.pathname = `/en${path}`
    return NextResponse.redirect(target, 308)
  }

  const renamed = RENAMED_PATHS[path]
  if (renamed !== undefined) {
    const target = request.nextUrl.clone()
    target.pathname = renamed
    return NextResponse.redirect(target, 308)
  }

  const response = handleI18nRouting(request)

  const existing = request.cookies.get(SESSION_COOKIE)?.value
  if (existing && (await isValidSessionToken(existing))) {
    return response
  }

  const token = await signSessionToken()
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    // Tied to the actual request protocol, not NODE_ENV: a production build
    // served over plain http (e.g. local `next start`, or Safari on any
    // non-https host) would otherwise mark the cookie Secure and the browser
    // would silently drop it, breaking the socket handshake.
    secure: request.nextUrl.protocol === 'https:',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  return response
}

export const config = {
  // Pages only — skip static assets and Next.js internals.
  matcher: ['/((?!_next/|favicon\\.ico|.*\\.).*)'],
}
