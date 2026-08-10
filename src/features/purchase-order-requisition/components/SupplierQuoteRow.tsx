import { Check, Upload, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput } from "@/components/shared/UBInput"
import { cn } from "@/lib/utils"
import { useRequisitionQuotesStore } from "@/store/requisition-quotes-store"

import {
  mapSupplierQuoteToUploadMeta,
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
  requisitionId?: number
  disabled?: boolean
  showRecommendedToggle?: boolean
  excludeSupplierIds?: string[]
}

function isPdfFile(file: File) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  )
}

export function SupplierQuoteRow({
  quote,
  onChange,
  onRemove,
  requisitionId,
  disabled = false,
  showRecommendedToggle = true,
  excludeSupplierIds = [],
}: SupplierQuoteRowProps) {
  const enqueueAndUploadQuote = useRequisitionQuotesStore(
    (state) => state.enqueueAndUploadQuote
  )
  const lastUploaded = useRequisitionQuotesStore(
    (state) => state.lastUploadedByClientId[quote.clientId]
  )
  const activeRequisitionIdFromStore = useRequisitionQuotesStore(
    (state) => state.activeRequisitionId
  )

  const fileInputRef = useRef<HTMLInputElement>(null)
  const requisitionIdRef = useRef(requisitionId)
  requisitionIdRef.current = requisitionId
  const quoteRef = useRef(quote)
  quoteRef.current = quote

  // Keep the selected File outside React parent races (module store + local).
  const [localFile, setLocalFile] = useState<File | null>(quote.file)
  const [localFileName, setLocalFileName] = useState(quote.fileName || "")
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(
    quote.previewUrl
  )
  const [pickerError, setPickerError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const localFileRef = useRef<File | null>(localFile)
  localFileRef.current = localFile

  // Adopt server attachment id when the store finishes a POST for this row.
  useEffect(() => {
    if (!lastUploaded || quote.attachmentId === lastUploaded.attachmentId) {
      return
    }
    onChange({
      ...quoteRef.current,
      attachmentId: lastUploaded.attachmentId,
      fileName: lastUploaded.fileName || quoteRef.current.fileName,
      file: localFileRef.current ?? quoteRef.current.file,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUploaded, quote.attachmentId])

  useEffect(() => {
    if (quote.file && quote.file !== localFileRef.current) {
      setLocalFile(quote.file)
      setLocalFileName(quote.fileName || quote.file.name)
      if (quote.previewUrl) {
        setLocalPreviewUrl(quote.previewUrl)
      }
    } else if (quote.fileName && !localFileName) {
      setLocalFileName(quote.fileName)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote.attachmentId, quote.file, quote.fileName, quote.previewUrl])

  const startUpload = async (file: File, supplierId: string) => {
    const activeRequisitionId =
      requisitionIdRef.current ??
      useRequisitionQuotesStore.getState().activeRequisitionId

    if (!activeRequisitionId) {
      setUploadError(
        "Waiting for draft save… the PDF will upload automatically once the requisition number appears."
      )
      return
    }

    if (quoteRef.current.attachmentId) {
      return
    }

    setIsUploading(true)
    setUploadError(null)

    const attachment = await enqueueAndUploadQuote({
      clientId: quote.clientId,
      requisitionId: activeRequisitionId,
      supplierId: Number(supplierId),
      file,
      meta: mapSupplierQuoteToUploadMeta(quoteRef.current),
    })

    setIsUploading(false)

    if (!attachment) {
      setUploadError(
        useRequisitionQuotesStore.getState().error ||
          "Failed to upload supplier quote."
      )
      return
    }

    setLocalFileName(attachment.file_name || file.name)
    onChange({
      ...quoteRef.current,
      attachmentId: attachment.id,
      fileName: attachment.file_name || file.name,
      file,
      previewUrl: localPreviewUrl,
      supplierId: String(attachment.supplier_id || supplierId),
    })
  }

  // When the draft id appears after the user already picked a PDF, POST it.
  useEffect(() => {
    const id = requisitionId ?? activeRequisitionIdFromStore
    if (disabled || !id || quote.attachmentId) {
      return
    }
    const file = localFileRef.current
    if (file && quote.supplierId) {
      void startUpload(file, quote.supplierId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRequisitionIdFromStore, requisitionId])

  const inputsDisabled = disabled || isUploading

  const clearLocalDocument = () => {
    if (localPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl)
    }
    setLocalFile(null)
    setLocalFileName("")
    setLocalPreviewUrl(null)
  }

  const handleFileChange = (file: File | null) => {
    revokeSupplierQuotePreview(quote)
    setPickerError(null)
    setUploadError(null)

    if (!file) {
      clearLocalDocument()
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
      setPickerError("Only PDF files are allowed.")
      return
    }

    if (!quote.supplierId) {
      setPickerError("Select a supplier before uploading a quote PDF.")
      return
    }

    if (localPreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(localPreviewUrl)
    }

    const previewUrl = URL.createObjectURL(file)
    localFileRef.current = file
    setLocalFile(file)
    setLocalFileName(file.name)
    setLocalPreviewUrl(previewUrl)

    onChange({
      ...quote,
      file,
      fileName: file.name,
      previewUrl,
      attachmentId: undefined,
    })

    // POST immediately — do not wait for a useEffect / parent state round-trip.
    void startUpload(file, quote.supplierId)
  }

  const openFilePicker = () => {
    if (inputsDisabled) {
      return
    }

    if (!quote.supplierId) {
      setPickerError("Select a supplier before uploading a quote PDF.")
      return
    }

    setPickerError(null)
    fileInputRef.current?.click()
  }

  const hasDocument = Boolean(
    localFile || quote.attachmentId || localFileName || quote.fileName
  )
  const displayFileName =
    localFileName || quote.fileName || localFile?.name || "Uploaded quote"
  const isPreferred = quote.isRecommended
  const displayError = uploadError || pickerError

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
            onValueChange={(supplierId) => {
              const next = { ...quote, supplierId }
              onChange(next)
              // If a PDF was chosen before supplier (shouldn't happen) or id
              // just became available, try upload.
              if (localFileRef.current && requisitionIdRef.current) {
                void startUpload(localFileRef.current, supplierId)
              }
            }}
            disabled={inputsDisabled}
            excludeSupplierIds={excludeSupplierIds}
          />

          <UBInput
            label="Quote reference"
            value={quote.quoteReferenceNumber}
            onChange={(event) =>
              onChange({ ...quote, quoteReferenceNumber: event.target.value })
            }
            placeholder="e.g. Q-2026-0142"
            disabled={inputsDisabled}
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
            disabled={inputsDisabled}
          />

          <div className="flex flex-col justify-end">
            {showRecommendedToggle ? (
              <button
                type="button"
                role="radio"
                aria-checked={isPreferred}
                disabled={inputsDisabled}
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
                  inputsDisabled && "cursor-not-allowed opacity-50"
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
            <p className="mb-2 block text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Quote PDF
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={PDF_ACCEPT}
              className="hidden"
              disabled={inputsDisabled}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null
                handleFileChange(file)
                event.target.value = ""
              }}
            />
            {inputsDisabled && !isUploading ? (
              <div
                className={cn(
                  "flex min-h-10 items-center gap-2 rounded-lg border border-solid border-input bg-muted/20 px-3 py-2 text-sm",
                  !hasDocument && "text-muted-foreground"
                )}
              >
                <Upload className="size-4 shrink-0 text-primary/80" aria-hidden />
                {hasDocument ? displayFileName : "No PDF attached"}
              </div>
            ) : (
              <>
                <UBButton
                  type="button"
                  variant="outline"
                  className={cn(
                    "flex h-auto min-h-10 w-full items-center justify-center gap-2 border-dashed px-3 py-2 text-sm font-normal",
                    hasDocument && "border-solid",
                    isUploading && "opacity-80"
                  )}
                  disabled={isUploading}
                  onClick={openFilePicker}
                >
                  <Upload className="size-4 shrink-0 text-primary/80" />
                  {isUploading
                    ? `Uploading ${displayFileName}...`
                    : hasDocument
                      ? displayFileName
                      : "Upload PDF quote"}
                </UBButton>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isUploading
                    ? "Please wait while the quotation PDF is uploaded."
                    : !requisitionId
                      ? "Waiting for draft save before uploading…"
                      : "PDF files only, up to 10 MB. Select a supplier first."}
                </p>
              </>
            )}
          </div>
        </div>

        {!disabled ? (
          <UBButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isUploading}
            aria-label="Remove supplier quote"
            className="shrink-0"
          >
            <X className="size-4" />
          </UBButton>
        ) : null}
      </div>

      {displayError ? (
        <p className="text-sm text-destructive">{displayError}</p>
      ) : null}

      {hasDocument ? (
        <PdfViewer
          file={localFile ?? quote.file}
          attachmentId={quote.attachmentId}
          fileName={displayFileName}
          onRemove={
            inputsDisabled
              ? undefined
              : () => {
                  handleFileChange(null)
                }
          }
          disabled={inputsDisabled}
        />
      ) : null}
    </div>
  )
}
