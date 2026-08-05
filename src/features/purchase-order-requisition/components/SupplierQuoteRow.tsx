import { Check, Upload, X } from "lucide-react"
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
  showRecommendedToggle?: boolean
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
  showRecommendedToggle = true,
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
  const isPreferred = quote.isRecommended

  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border p-4 shadow-sm transition-colors",
        isPreferred
          ? "border-emerald-500/70 bg-emerald-50/70 ring-1 ring-emerald-500/30"
          : "border-border/70 bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2 xl:col-span-4">
            <div className="flex flex-wrap items-center gap-2">
              {isPreferred ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                  <Check className="size-3.5" aria-hidden />
                  Preferred supplier
                </span>
              ) : showRecommendedToggle ? (
                <span className="text-xs text-muted-foreground">
                  Not preferred
                </span>
              ) : null}
            </div>
          </div>

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
            {showRecommendedToggle ? (
              <button
                type="button"
                role="radio"
                aria-checked={isPreferred}
                disabled={disabled}
                onClick={() => {
                  if (!isPreferred) {
                    onChange({ ...quote, isRecommended: true })
                  }
                }}
                className={cn(
                  "mb-2 inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors",
                  isPreferred
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-input bg-background text-foreground hover:border-emerald-500/50 hover:bg-emerald-50/60",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {isPreferred ? (
                  <>
                    <Check className="size-4 shrink-0" aria-hidden />
                    Preferred
                  </>
                ) : (
                  "Mark as preferred"
                )}
              </button>
            ) : null}
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
