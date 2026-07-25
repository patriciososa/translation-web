import createMiddleware from 'next-intl/middleware'
import type { NextRequest, NextResponse } from 'next/server'
import { routing } from '@/i18n/routing'
import { isValidSessionToken, SESSION_COOKIE, signSessionToken } from '@/lib/jwt'

const handleI18nRouting = createMiddleware(routing)

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
