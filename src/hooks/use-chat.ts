'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { trackEvent } from '@/lib/analytics'
import { UploadError, sizeLimitMb, uploadFile } from '@/services/files'
import { chatService } from '@/services/socket'
import type { ChatMessage, ConnectionState, FileUploadState } from '@/types/chat'

export interface ChatState {
  messages: ChatMessage[]
  connectionState: ConnectionState
  operatorTyping: boolean
  /** True once the conversation has been ended from the operator side. */
  closed: boolean
  error: string | null
  upload: FileUploadState | null
  sendMessage: (text: string) => void
  sendFile: (file: File) => void
  notifyTyping: () => void
  dismissError: () => void
}

const TYPING_IDLE_MS = 2500

/** Connects the chat UI to the chat service and owns all conversation state. */
export function useChat(): ChatState {
  const t = useTranslations('errors')
  const locale = useLocale()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting')
  const [operatorTyping, setOperatorTyping] = useState(false)
  const [closed, setClosed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [upload, setUpload] = useState<FileUploadState | null>(null)
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasSentMessage = useRef(false)

  useEffect(() => {
    chatService.connect({
      // chat:created carries the full history, so it replaces local state.
      // This also restores the conversation after a reconnection.
      onCreated: (history) => setMessages(history),
      onMessage: (message) =>
        setMessages((current) =>
          current.some((m) => m.id === message.id) ? current : [...current, message],
        ),
      onTyping: setOperatorTyping,
      onClosed: () => {
        setOperatorTyping(false)
        setClosed(true)
      },
      onError: setError,
      onConnectionChange: setConnectionState,
    }, locale)

    return () => chatService.disconnect()
  }, [locale])

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim()
    if (trimmed.length === 0) return
    chatService.sendMessage(trimmed)
    trackEvent('quote_message_sent', { link_id: 'chat-message', section: 'assistant' })
    // The first message is the lead-generation conversion signal, imported in
    // Google Ads as the primary conversion (chat_opened is only secondary).
    if (!hasSentMessage.current) {
      hasSentMessage.current = true
      trackEvent('chat_message_sent', { link_id: 'chat-message', section: 'assistant' })
    }
    chatService.sendTyping(false)
    if (typingTimeout.current !== null) clearTimeout(typingTimeout.current)
  }, [])

  const notifyTyping = useCallback(() => {
    // Announce typing once, then clear it after a pause instead of emitting
    // an event per keystroke.
    if (typingTimeout.current === null) chatService.sendTyping(true)
    else clearTimeout(typingTimeout.current)

    typingTimeout.current = setTimeout(() => {
      chatService.sendTyping(false)
      typingTimeout.current = null
    }, TYPING_IDLE_MS)
  }, [])

  const sendFile = useCallback(
    (file: File) => {
      setError(null)
      setUpload({ fileName: file.name, progress: 0 })
      // The backend echoes the confirmed attachment back as a chat:file
      // message, so success needs no local message handling here.
      uploadFile(file, (progress) => setUpload({ fileName: file.name, progress }))
        .then(() => trackEvent('quote_file_uploaded', { link_id: 'file-upload', section: 'assistant' }))
        .catch((uploadError: unknown) => {
          // Backend messages are shown verbatim; local codes are translated.
          if (uploadError instanceof UploadError) {
            // Recordings are allowed a larger size than documents, so the
            // limit quoted back has to be the one this file was judged by.
            setError(
              uploadError.serverMessage ??
                t(uploadError.code, { maxSizeMb: sizeLimitMb(file.name) }),
            )
          } else {
            setError(t('failed'))
          }
        })
        .finally(() => setUpload(null))
    },
    [t],
  )

  const dismissError = useCallback(() => setError(null), [])

  return {
    messages,
    connectionState,
    operatorTyping,
    closed,
    error,
    upload,
    sendMessage,
    sendFile,
    notifyTyping,
    dismissError,
  }
}
