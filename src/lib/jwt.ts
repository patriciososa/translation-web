import { SignJWT } from 'jose'
import { jwtVerify } from 'jose'

const DEV_SECRET = 'dev-only-jwt-secret'

let cachedSecret: Uint8Array | undefined

/**
 * Shared with the backend, which validates this token on every Socket.IO
 * handshake. The `sub` claim is the chat session identifier.
 *
 * The development fallback is in the repository, so a production server must
 * never sign with it: anyone could then mint a token for any chat session.
 * Without JWT_SECRET a production server refuses to issue or accept sessions
 * (every page fails loudly) rather than run on a public secret — the backend's
 * config does the same. Read on first use, not at import, so `next build` does
 * not need the secret.
 */
function secret(): Uint8Array {
  if (cachedSecret !== undefined) return cachedSecret
  const value = process.env.JWT_SECRET
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is not set: refusing to sign chat sessions with the development secret.')
  }
  cachedSecret = new TextEncoder().encode(value || DEV_SECRET)
  return cachedSecret
}

export const SESSION_COOKIE = 'jwt'

export async function signSessionToken(): Promise<string> {
  return new SignJWT()
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret())
}

export async function isValidSessionToken(token: string): Promise<boolean> {
  // Outside the try: a missing secret is a server fault, not an invalid token.
  const key = secret()
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    return typeof payload.sub === 'string' && payload.sub.length > 0
  } catch {
    return false
  }
}
