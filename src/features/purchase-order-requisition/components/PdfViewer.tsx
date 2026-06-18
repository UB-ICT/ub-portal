import { Download, FileText, X } from "lucide-react"
import { useEffect, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import {
  downloadRequisitionAttachment,
  fetchAttachmentBlob,
} from "@/lib/api/attachments"
import { cn } from "@/lib/utils"

type PdfViewerProps = {
  file?: File | null
  attachmentId?: number
  fileName: string
  className?: string
  onRemove?: () => void
  disabled?: boolean
}

function triggerBlobDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function PdfViewer({
  file,
  attachmentId,
  fileName,
  className,
  onRemove,
  disabled = false,
}: PdfViewerProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let objectUrl: string | null = null

    async function loadPreview() {
      setError(null)

      if (file) {
        objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)
        setIsLoading(false)
        return
      }

      if (!attachmentId) {
        setPreviewUrl(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const blob = await fetchAttachmentBlob(attachmentId)

        if (!active) {
          return
        }

        objectUrl = URL.createObjectURL(blob)
        setPreviewUrl(objectUrl)
      } catch (loadError) {
        if (!active) {
          return
        }

        setPreviewUrl(null)
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load PDF preview."
        )
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadPreview()

    return () => {
      active = false

      if (objectUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [attachmentId, file])

  const handleDownload = async () => {
    if (file) {
      triggerBlobDownload(file, fileName)
      return
    }

    if (!attachmentId) {
      return
    }

    const blob = await downloadRequisitionAttachment(attachmentId)
    triggerBlobDownload(blob, fileName)
  }

  if (!file && !attachmentId) {
    return null
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border/70 bg-muted/10",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/20 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <FileText className="size-4 shrink-0 text-primary/80" />
          <span className="truncate">{fileName || "Quote document.pdf"}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <UBButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleDownload()}
            disabled={disabled || isLoading}
          >
            <Download className="size-4" data-icon="inline-start" />
            Download
          </UBButton>
          {onRemove ? (
            <UBButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={disabled}
              aria-label="Remove quote file"
            >
              <X className="size-4" />
            </UBButton>
          ) : null}
        </div>
      </div>

      <div className="relative min-h-72 bg-background">
        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">
            Loading PDF preview...
          </div>
        ) : null}
        {error ? (
          <div className="flex min-h-72 items-center justify-center px-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {previewUrl && !error ? (
          <iframe
            title={fileName || "Quote PDF preview"}
            src={previewUrl}
            className="h-96 w-full border-0"
          />
        ) : null}
      </div>
    </div>
  )
}
