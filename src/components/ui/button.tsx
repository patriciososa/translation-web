import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'outline' | 'white'

const BASE =
  'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-md px-5 text-[15px] font-semibold transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:shadow-none motion-safe:disabled:active:scale-100'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary shadow-button hover:bg-primary-hover active:bg-primary-pressed disabled:bg-disabled focus-visible:outline-primary',
  outline:
    'border border-border-strong bg-surface text-foreground shadow-soft hover:border-muted hover:bg-surface-secondary active:bg-surface-secondary disabled:text-disabled focus-visible:outline-primary',
  white:
    'bg-on-navy text-navy shadow-button hover:bg-white active:bg-navy-muted/50 disabled:text-disabled focus-visible:outline-on-navy',
}

export function buttonClasses(variant: ButtonVariant = 'primary', className = ''): string {
  return `${BASE} ${VARIANTS[variant]} ${className}`
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  /** Shows a spinner and blocks interaction while an async action runs. */
  loading?: boolean
}

export function Button({
  className = '',
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, className)}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
        />
      )}
      {children}
    </button>
  )
}
