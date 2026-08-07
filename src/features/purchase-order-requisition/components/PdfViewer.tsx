import { Download, Eye, FileText, X } from "lucide-react"
import { useEffect, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  /** Custom blob loader (e.g. activity-log attachments). */
  loadBlob?: () => Promise<Blob>
  /** Custom download blob loader. Defaults to loadBlob when omitted. */
  downloadBlob?: () => Promise<Blob>
  previewDescription?: string
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
  loadBlob,
  downloadBlob,
  previewDescription = "Supplier quote PDF preview",
}: PdfViewerProps) {
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayName = fileName || "Quote document.pdf"
  const canLoadRemote = Boolean(loadBlob || attachmentId)

  useEffect(() => {
    if (!open) {
      return
    }

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

      if (!canLoadRemote) {
        setPreviewUrl(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const blob = loadBlob
          ? await loadBlob()
          : await fetchAttachmentBlob(attachmentId!)

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

      setPreviewUrl(null)
    }
  }, [attachmentId, canLoadRemote, file, loadBlob, open])

  const handleDownload = async () => {
    if (file) {
      triggerBlobDownload(file, displayName)
      return
    }

    if (!canLoadRemote) {
      return
    }

    const blob = downloadBlob
      ? await downloadBlob()
      : loadBlob
        ? await loadBlob()
        : await downloadRequisitionAttachment(attachmentId!)
    triggerBlobDownload(blob, displayName)
  }

  if (!file && !canLoadRemote) {
    return null
  }

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/10 px-3 py-2",
          className
        )}
      >
        <UBButton
          type="button"
          variant="outline"
          size="sm"
          className="min-w-0 flex-1 justify-start"
          onClick={() => setOpen(true)}
        >
          <FileText className="size-4 shrink-0" data-icon="inline-start" />
          <span className="truncate">{displayName}</span>
          <Eye className="ml-auto size-4 shrink-0 opacity-70" />
          <span className="sr-only">View PDF</span>
        </UBButton>
        <div className="flex shrink-0 items-center gap-1">
          <UBButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void handleDownload()}
          >
            <Download className="size-4" data-icon="inline-start" />
            Download
          </UBButton>
          {onRemove && !disabled ? (
            <UBButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              aria-label="Remove quote file"
            >
              <X className="size-4" />
            </UBButton>
          ) : null}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90vh] w-[min(96vw,56rem)] max-w-4xl flex-col gap-3 overflow-hidden p-4 sm:max-w-4xl">
          <DialogHeader className="pr-8">
            <DialogTitle className="truncate">{displayName}</DialogTitle>
            <DialogDescription>{previewDescription}</DialogDescription>
          </DialogHeader>

          <div className="relative min-h-[70vh] flex-1 overflow-hidden rounded-lg border border-border/70 bg-background">
            {isLoading ? (
              <div className="flex min-h-[70vh] items-center justify-center text-sm text-muted-foreground">
                Loading PDF preview...
              </div>
            ) : null}
            {error ? (
              <div className="flex min-h-[70vh] items-center justify-center px-4 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {previewUrl && !error ? (
              <iframe
                title={displayName}
                src={previewUrl}
                className="h-[70vh] w-full border-0"
              />
            ) : null}
          </div>

          <div className="flex justify-end gap-2">
            <UBButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleDownload()}
            >
              <Download className="size-4" data-icon="inline-start" />
              Download
            </UBButton>
            <UBButton type="button" size="sm" onClick={() => setOpen(false)}>
              Close
            </UBButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
