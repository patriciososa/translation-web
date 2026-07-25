'use client'

import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { SendHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AttachmentButton } from './attachment-button'
import { Button } from '@/components/ui/button'

interface MessageInputProps {
  disabled: boolean
  uploading: boolean
  onSend: (text: string) => void
  onSendFile: (file: File) => void
  onTyping: () => void
}

export function MessageInput({ disabled, uploading, onSend, onSendFile, onTyping }: MessageInputProps) {
  const t = useTranslations('chat')
  const [text, setText] = useState('')

  const submit = () => {
    if (disabled || text.trim().length === 0) return
    onSend(text)
    setText('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border bg-surface p-4">
      <AttachmentButton disabled={disabled || uploading} onSelect={onSendFile} />
      <label htmlFor="message-input" className="sr-only">
        {t('messageLabel')}
      </label>
      <textarea
        id="message-input"
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          onTyping()
        }}
        onKeyDown={handleKeyDown}
        placeholder={t('placeholder')}
        rows={2}
        disabled={disabled}
        className="min-h-11 flex-1 resize-none rounded-lg border border-border bg-surface px-3.5 py-2.5 text-base text-foreground transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/15 disabled:bg-surface-secondary disabled:text-disabled"
      />
      <Button
        type="submit"
        disabled={disabled || text.trim().length === 0}
        aria-label={t('sendMessage')}
        title={t('sendMessage')}
        className="size-11 shrink-0 px-0!"
      >
        <SendHorizontal aria-hidden="true" className="size-5" />
      </Button>
    </form>
  )
}
