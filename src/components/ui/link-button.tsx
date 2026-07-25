import Link from 'next/link'
import type { ReactNode } from 'react'
import { buttonClasses } from './button'
import type { ButtonVariant } from './button'

interface LinkButtonProps {
  href: string
  variant?: ButtonVariant
  className?: string
  onClick?: () => void
  children: ReactNode
}

/** An anchor styled exactly like a Button, for navigation CTAs. */
export function LinkButton({ href, variant = 'primary', className = '', onClick, children }: LinkButtonProps) {
  return (
    <Link href={href} onClick={onClick} className={buttonClasses(variant, className)}>
      {children}
    </Link>
  )
}
