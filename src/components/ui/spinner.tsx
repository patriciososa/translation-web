export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted" role="status">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-current/25 border-t-primary"
      />
      {label ?? 'Loading...'}
    </span>
  )
}
