'use client'

import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import { Paperclip } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FILE_INPUT_ACCEPT } from '@/services/files'

interface AttachmentButtonProps {
  disabled: boolean
  onSelect: (file: File) => void
}

/** Opens the native file picker for sharing a document in the conversation. */
export function AttachmentButton({ disabled, onSelect }: AttachmentButtonProps) {
  const t = useTranslations('chat')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file !== undefined) onSelect(file)
    // Allow picking the same file again after an error.
    event.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={FILE_INPUT_ACCEPT}
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        aria-label={t('attach')}
        title={t('attach')}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-foreground-secondary transition-colors duration-150 hover:border-border-strong hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-disabled"
      >
        <Paperclip aria-hidden="true" className="size-5" />
      </button>
    </>
  )
}
