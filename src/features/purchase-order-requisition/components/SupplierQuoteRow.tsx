import { Upload, X } from "lucide-react"
import { useId } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput } from "@/components/shared/UBInput"
import { cn } from "@/lib/utils"

import {
  revokeSupplierQuotePreview,
  type SupplierQuoteDraft,
} from "../lib/supplier-quotes"
import { PdfViewer } from "./PdfViewer"
import { SupplierQuoteSelect } from "./SupplierQuoteSelect"

const PDF_ACCEPT = "application/pdf,.pdf"

type SupplierQuoteRowProps = {
  quote: SupplierQuoteDraft
  onChange: (quote: SupplierQuoteDraft) => void
  onRemove: () => void
  disabled?: boolean
  excludeSupplierIds?: string[]
  uploadError?: string | null
}

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
}

export function SupplierQuoteRow({
  quote,
  onChange,
  onRemove,
  disabled = false,
  excludeSupplierIds = [],
  uploadError,
}: SupplierQuoteRowProps) {
  const inputId = useId()

  const handleFileChange = (file: File | null) => {
    revokeSupplierQuotePreview(quote)

    if (!file) {
      onChange({
        ...quote,
        file: null,
        fileName: "",
        previewUrl: null,
        attachmentId: undefined,
      })
      return
    }

    if (!isPdfFile(file)) {
      return
    }

    onChange({
      ...quote,
      file,
      fileName: file.name,
      previewUrl: URL.createObjectURL(file),
      attachmentId: undefined,
    })
  }

  const handleRemoveFile = () => {
    handleFileChange(null)
  }

  const hasDocument = Boolean(quote.file || quote.attachmentId)

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SupplierQuoteSelect
            value={quote.supplierId}
            onValueChange={(supplierId) => onChange({ ...quote, supplierId })}
            disabled={disabled}
            excludeSupplierIds={excludeSupplierIds}
          />

          <UBInput
            label="Quote reference"
            value={quote.quoteReferenceNumber}
            onChange={(event) =>
              onChange({ ...quote, quoteReferenceNumber: event.target.value })
            }
            placeholder="e.g. Q-2026-0142"
            disabled={disabled}
          />

          <UBInput
            label="Quoted total"
            type="number"
            min="0"
            step="0.01"
            value={quote.quotedTotal}
            onChange={(event) =>
              onChange({ ...quote, quotedTotal: event.target.value })
            }
            placeholder="0.00"
            disabled={disabled}
          />

          <div className="flex flex-col justify-end">
            <label className="mb-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={quote.isRecommended}
                onChange={(event) =>
                  onChange({ ...quote, isRecommended: event.target.checked })
                }
                disabled={disabled}
                className="size-4 rounded border-input"
              />
              <span>Recommended</span>
            </label>
          </div>

          <div className="w-full md:col-span-2 xl:col-span-4">
            <label
              htmlFor={inputId}
              className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground"
            >
              Quote PDF
            </label>
            <label
              htmlFor={inputId}
              className={cn(
                "flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-background px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-muted/20",
                disabled && "cursor-not-allowed opacity-50",
                hasDocument && "border-solid"
              )}
            >
              <Upload className="size-4 shrink-0 text-primary/80" />
              {hasDocument
                ? quote.fileName || "Uploaded quote"
                : "Upload PDF quote"}
            </label>
            <input
              id={inputId}
              type="file"
              accept={PDF_ACCEPT}
              className="sr-only"
              disabled={disabled}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                handleFileChange(file)
                event.target.value = ""
              }}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              PDF files only, up to 10 MB.
            </p>
          </div>
        </div>

        <UBButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove supplier quote"
          className="shrink-0"
        >
          <X className="size-4" />
        </UBButton>
      </div>

      {uploadError ? (
        <p className="text-sm text-destructive">{uploadError}</p>
      ) : null}

      {hasDocument ? (
        <PdfViewer
          file={quote.file}
          attachmentId={quote.attachmentId}
          fileName={quote.fileName}
          onRemove={handleRemoveFile}
          disabled={disabled}
        />
      ) : null}
    </div>
  )
}
