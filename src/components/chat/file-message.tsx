import { FileText } from 'lucide-react'
import { TrackedAnchor } from '@/components/ui/tracked'
import { downloadUrl } from '@/services/api'
import type { FileAttachment } from '@/types/chat'
import { formatFileSize } from '@/utils/format-file-size'

/** A shared document rendered inside a message bubble, linking to its download. */
export function FileMessage({ attachment }: { attachment: FileAttachment }) {
  return (
    <TrackedAnchor
      href={downloadUrl(attachment.downloadUrl)}
      download={attachment.name}
      event="quote_file_download"
      eventParams={{ link_id: 'file-download', section: 'assistant' }}
      className="flex items-center gap-3 rounded-md p-1 focus-visible:outline-2 focus-visible:outline-primary"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-secondary">
        <FileText aria-hidden="true" className="size-5 text-primary" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-medium text-foreground underline underline-offset-2">
          {attachment.name}
        </span>
        <span className="block text-xs text-muted">{formatFileSize(attachment.size)}</span>
      </span>
    </TrackedAnchor>
  )
}
