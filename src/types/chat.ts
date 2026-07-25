export type MessageSender = 'customer' | 'operator' | 'system'

/** Metadata of a shared document; content is served by the backend over HTTP. */
export interface FileAttachment {
  fileId: string
  name: string
  size: number
  mimeType: string
  /** Download path relative to the backend origin. */
  downloadUrl: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  sender: MessageSender
  text: string
  timestamp: number
  attachment?: FileAttachment
}

export interface FileUploadState {
  fileName: string
  /** 0..1 fraction of bytes sent. */
  progress: number
}

export type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
