'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type { ButtonVariant } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'
import { openQuoteAssistant } from '@/lib/quote-assistant'

interface QuoteChatButtonProps {
  variant?: ButtonVariant
  className?: string
  /** Where on the page this CTA lives; reported with the GA click event. */
  location?: string
  onClick?: () => void
  children: ReactNode
}

/** A CTA that opens the floating quote assistant. */
export function QuoteChatButton({
  variant = 'outline',
  className,
  location = 'unknown',
  onClick,
  children,
}: QuoteChatButtonProps) {
  const handleClick = () => {
    trackEvent('quote_cta_click', { location, link_id: 'quote-cta', section: 'cta' })
    onClick?.()
    openQuoteAssistant()
  }
  return (
    <Button variant={variant} className={className} onClick={handleClick}>
      {children}
    </Button>
  )
}
