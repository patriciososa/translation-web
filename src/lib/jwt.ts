import { SignJWT } from 'jose'
import { jwtVerify } from 'jose'

// Shared with the backend, which validates this token on every Socket.IO
// handshake. The `sub` claim is the chat session identifier.
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-only-jwt-secret')

export const SESSION_COOKIE = 'jwt'

export async function signSessionToken(): Promise<string> {
  return new SignJWT()
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export async function isValidSessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    return typeof payload.sub === 'string' && payload.sub.length > 0
  } catch {
    return false
  }
}
