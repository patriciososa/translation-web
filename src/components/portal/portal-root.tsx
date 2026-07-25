'use client'

import dynamic from 'next/dynamic'
import type { PortalMessages } from './portal-app'

/**
 * Client-only mount of the portal. Everything it starts from — the link token
 * in the URL, sessionStorage, the browser's language and time zone — exists
 * only in the browser, so there is nothing useful to server-render, and doing
 * so would only produce a first render that disagrees with the client's.
 */
const PortalApp = dynamic(() => import('./portal-app').then((m) => m.PortalApp), {
  ssr: false,
  loading: () => (
    <main className="grid min-h-dvh place-items-center p-6">
      <span aria-hidden="true" className="size-6 animate-spin rounded-full border-2 border-muted/30 border-t-primary" />
    </main>
  ),
})

export function PortalRoot({ messages }: { messages: PortalMessages }) {
  return <PortalApp messages={messages} />
}
