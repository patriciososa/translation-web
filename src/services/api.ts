/** Backend origin shared by the Socket.IO connection and the HTTP file endpoints. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:4000'

/** Absolute download URL for an attachment's backend-relative path. */
export function downloadUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}
