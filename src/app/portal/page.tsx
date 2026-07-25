import { PortalRoot } from '@/components/portal/portal-root'
import type { PortalMessages } from '@/components/portal/portal-app'
import en from '../../../messages/en.json'
import es from '../../../messages/es.json'
import fr from '../../../messages/fr.json'

/**
 * The portal is opened with `#token=…`. A fragment is never sent in a request,
 * so the token is read in the browser only (PortalApp) and the server never
 * sees which document is behind a page view. (Links issued before 2026-11-10
 * used `?token=`, which the server did see; see services/portal.ts.) Only the `portal` namespace of each locale reaches the client.
 */
const MESSAGES: PortalMessages = {
  es: { portal: es.portal },
  en: { portal: en.portal },
  fr: { portal: fr.portal },
}

export default function PortalPage() {
  return <PortalRoot messages={MESSAGES} />
}
