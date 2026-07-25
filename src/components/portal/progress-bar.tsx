'use client'

import { useFormatter, useTranslations } from 'next-intl'
import type { PortalProgress } from '@/types/portal'

/**
 * Words translated against the original document's stored total, with the
 * reviewed share drawn as a second segment inside the translated one. The bar
 * stops at 100% (a translation can run longer than its source); the label
 * always shows the real counts.
 */
export function ProgressBar({ progress }: { progress: PortalProgress }) {
  const t = useTranslations('portal')
  const format = useFormatter()
  const { totalWords, translatedWords, reviewedWords } = progress
  const pct = (n: number) => (totalWords === 0 ? 0 : Math.min(100, (n / totalWords) * 100))
  const asPercent = (fraction: number) => format.number(fraction, { style: 'percent', maximumFractionDigits: 1 })
  // Long sources start below 0.1% (20 of 45,947 words): say so instead of a misleading "0 %".
  const shareOf = (words: number) => {
    const share = pct(words) / 100
    return words > 0 && share < 0.001 ? `< ${asPercent(0.001)}` : asPercent(share)
  }
  const percent = shareOf(translatedWords)
  // Grouping always on: Spanish would otherwise print 2000 but 45.947.
  const count = (n: number) => format.number(n, { useGrouping: 'always' })
  const counts = { translated: count(translatedWords), total: count(totalWords) }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <p className="font-display text-lg font-semibold text-foreground">{t('wordsTranslated', counts)}</p>
        {/* Translated above reviewed, each keyed to its colour in the bar. */}
        <div className="flex flex-col items-start gap-0.5 text-sm sm:items-end">
          <p className="flex items-center gap-1.5 font-medium text-primary">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />
            {t('percentTranslated', { percent })}
          </p>
          <p className="flex items-center gap-1.5 text-foreground-secondary">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-success" />
            {t('wordsReviewed', { percent: shareOf(reviewedWords) })}
          </p>
        </div>
      </div>
      <div
        role="progressbar"
        aria-label={t('progressLabel')}
        aria-valuemin={0}
        aria-valuemax={totalWords}
        aria-valuenow={Math.min(translatedWords, totalWords)}
        aria-valuetext={`${t('wordsTranslated', counts)} (${percent})`}
        className="relative h-3 overflow-hidden rounded-full bg-surface-secondary"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${pct(translatedWords)}%`, minWidth: translatedWords > 0 ? 4 : 0 }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-success transition-[width] duration-500 ease-out"
          style={{ width: `${pct(reviewedWords)}%`, minWidth: reviewedWords > 0 ? 4 : 0 }}
        />
      </div>
    </div>
  )
}
