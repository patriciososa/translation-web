import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { API_BASE_URL } from './api'
import type { ChatMessage, ConnectionState } from '@/types/chat'

export interface ChatEventHandlers {
  onCreated: (messages: ChatMessage[]) => void
  onMessage: (message: ChatMessage) => void
  onTyping: (typing: boolean) => void
  onClosed: () => void
  onError: (message: string) => void
  onConnectionChange: (state: ConnectionState) => void
}

/**
 * Encapsulates all Socket.IO communication with the backend. Components never
 * touch the socket directly — they interact through this service only.
 *
 * Authentication is transparent: the HttpOnly `jwt` cookie is sent with the
 * handshake (`withCredentials`), so no token handling happens in the browser.
 */
/** The browser's IANA zone, or null in the rare runtime that cannot report one. */
function resolveTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null
  } catch {
    return null
  }
}

export class ChatService {
  private socket: Socket | null = null

  connect(handlers: ChatEventHandlers, locale: string): void {
    if (this.socket !== null) return

    handlers.onConnectionChange('connecting')

    // The locale tells the backend which language to greet the customer in,
    // and the time zone which clock to greet them by: the operator side used
    // to run on server time and wished people a good day at their midnight.
    const socket = io(API_BASE_URL, {
      withCredentials: true,
      auth: { locale, timeZone: resolveTimeZone() },
    })
    this.socket = socket

    socket.on('connect', () => handlers.onConnectionChange('connected'))
    socket.on('disconnect', (reason) => {
      // Socket.IO never retries after an explicit disconnect from either
      // side, so reporting 'reconnecting' there would stick forever.
      const permanent = reason === 'io client disconnect' || reason === 'io server disconnect'
      handlers.onConnectionChange(permanent ? 'disconnected' : 'reconnecting')
    })
    socket.io.on('reconnect_attempt', () => handlers.onConnectionChange('reconnecting'))
    socket.on('connect_error', () => handlers.onConnectionChange('reconnecting'))

    socket.on('chat:created', (payload: { sessionId: string; messages: ChatMessage[] }) => {
      handlers.onCreated(payload.messages)
    })
    socket.on('chat:message', (message: ChatMessage) => handlers.onMessage(message))
    // Document shares are ordinary messages with attachment metadata attached.
    socket.on('chat:file', (message: ChatMessage) => handlers.onMessage(message))
    socket.on('chat:typing', (payload: { typing: boolean }) => handlers.onTyping(payload.typing))
    socket.on('chat:closed', () => {
      handlers.onClosed()
      handlers.onConnectionChange('disconnected')
      this.disconnect()
    })
    socket.on('chat:error', (payload: { message: string }) => handlers.onError(payload.message))
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }

  sendMessage(text: string): void {
    this.socket?.emit('chat:message', { text })
  }

  sendTyping(typing: boolean): void {
    this.socket?.emit('chat:typing', { typing })
  }

  closeChat(): void {
    this.socket?.emit('chat:close')
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}

export const chatService = new ChatService()
