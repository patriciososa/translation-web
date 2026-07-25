import { API_BASE_URL } from './api'

/** Document formats accepted by the backend, keyed by lowercase extension. */
const ALLOWED_DOCUMENT_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text',
  txt: 'text/plain',
  rtf: 'application/rtf',
}

/**
 * Recordings the backend accepts too: a transcription, subtitling or
 * voice-over job has no document to send — the material itself is the audio or
 * the video. Mirrors api/src/files/validation.ts.
 */
const ALLOWED_MEDIA_TYPES: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  oga: 'audio/ogg',
  opus: 'audio/ogg',
  flac: 'audio/flac',
  mp4: 'video/mp4',
  m4v: 'video/x-m4v',
  mov: 'video/quicktime',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
}

const ALLOWED_UPLOAD_TYPES: Record<string, string> = {
  ...ALLOWED_DOCUMENT_TYPES,
  ...ALLOWED_MEDIA_TYPES,
}

export const MAX_FILE_SIZE_MB = 10
/** Recordings get their own, larger ceiling (MAX_MEDIA_FILE_SIZE_MB server-side). */
export const MAX_MEDIA_FILE_SIZE_MB = 50

/** Value for the file input's `accept` attribute. */
export const FILE_INPUT_ACCEPT = Object.keys(ALLOWED_UPLOAD_TYPES)
  .map((extension) => `.${extension}`)
  .join(',')

/** How large this particular file is allowed to be, in megabytes. */
export function sizeLimitMb(name: string): number {
  return extensionOf(name) in ALLOWED_MEDIA_TYPES ? MAX_MEDIA_FILE_SIZE_MB : MAX_FILE_SIZE_MB
}

/** Codes double as errors.* message keys, so the UI can translate them. */
export type UploadErrorCode = 'unsupported-type' | 'too-large' | 'empty' | 'failed' | 'network'

/**
 * An upload failure described by a code instead of display text: this module
 * runs outside React, so the UI layer resolves the code (or the backend's own
 * message, when it sent one) into the visitor's language.
 */
export class UploadError extends Error {
  constructor(
    readonly code: UploadErrorCode,
    /** A human-readable message from the backend, shown verbatim when present. */
    readonly serverMessage?: string,
  ) {
    super(serverMessage ?? `upload failed: ${code}`)
    this.name = 'UploadError'
  }
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.')
  if (dot <= 0 || dot === name.length - 1) return ''
  return name.slice(dot + 1).toLowerCase()
}

/**
 * Uploads a document to the conversation. The backend validates the file,
 * stores it, and echoes it into the chat as a `chat:file` message — so a
 * successful upload needs no local state updates.
 *
 * Rejects with an UploadError on validation or transport errors.
 */
export function uploadFile(file: File, onProgress: (fraction: number) => void): Promise<void> {
  const mimeType = ALLOWED_UPLOAD_TYPES[extensionOf(file.name)]
  if (mimeType === undefined) {
    return Promise.reject(new UploadError('unsupported-type'))
  }
  if (file.size > sizeLimitMb(file.name) * 1024 * 1024) {
    return Promise.reject(new UploadError('too-large'))
  }
  if (file.size === 0) {
    return Promise.reject(new UploadError('empty'))
  }

  // XMLHttpRequest instead of fetch: upload progress events.
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', `${API_BASE_URL}/api/files`)
    request.withCredentials = true
    request.setRequestHeader('Content-Type', mimeType)
    request.setRequestHeader('X-File-Name', encodeURIComponent(file.name))

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total)
    }

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve()
        return
      }
      let serverMessage: string | undefined
      try {
        const body = JSON.parse(request.responseText) as { error?: string }
        if (typeof body.error === 'string') serverMessage = body.error
      } catch {
        // Fall through to the generic code.
      }
      reject(new UploadError('failed', serverMessage))
    }
    request.onerror = () => reject(new UploadError('network'))

    request.send(file)
  })
}
