interface SectionHeadingProps {
  title: string
  description?: string
  align?: 'left' | 'center'
  /** Heading element; h3 renders smaller, for sections lower in the visual hierarchy. */
  as?: 'h2' | 'h3'
}

const HEADING_CLASSES = {
  h2: 'font-display text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl',
  h3: 'font-display text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl',
} as const

export function SectionHeading({
  title,
  description,
  align = 'left',
  as: Heading = 'h2',
}: SectionHeadingProps) {
  return (
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <Heading className={HEADING_CLASSES[Heading]}>{title}</Heading>
      {description !== undefined && (
        <p className="mt-4 text-lg leading-relaxed text-pretty text-foreground-secondary">
          {description}
        </p>
      )}
    </div>
  )
}
