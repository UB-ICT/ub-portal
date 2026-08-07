import { Plus } from "lucide-react"
import { useEffect, useRef } from "react"

import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { UBButton } from "@/components/shared/UBButton"
import { cn } from "@/lib/utils"
import { useRequisitionQuotesStore } from "@/store/requisition-quotes-store"

import {
  applyRecommendedSupplierDefaults,
  createEmptySupplierQuote,
  getCompleteSupplierQuotes,
  getSupplierQuoteRequirementMessage,
  needsQuoteWaiverReason,
  revokeSupplierQuotePreview,
  SUPPLIER_QUOTE_HIGH_VALUE_THRESHOLD,
  type SupplierQuoteDraft,
} from "../lib/supplier-quotes"
import { SupplierQuoteRow } from "./SupplierQuoteRow"

type RequisitionSupplierQuotesProps = {
  quotes: SupplierQuoteDraft[]
  onChange: (quotes: SupplierQuoteDraft[]) => void
  quoteWaiverReason?: string
  onQuoteWaiverReasonChange?: (reason: string) => void
  requisitionId?: number
  requisitionTotal?: number
  disabled?: boolean
  className?: string
  error?: string | null
}

function mapAttachmentsToQuotes(
  attachments: NonNullable<
    Awaited<
      ReturnType<
        ReturnType<typeof useRequisitionQuotesStore.getState>["fetchAttachments"]
      >
    >
  >,
  existingQuotes: SupplierQuoteDraft[] = []
): SupplierQuoteDraft[] {
  return attachments.map((attachment) => {
    const existing = existingQuotes.find(
      (quote) =>
        quote.attachmentId === attachment.id ||
        quote.supplierId === String(attachment.supplier_id)
    )

    return {
      clientId: existing?.clientId ?? `attachment-${attachment.id}`,
      supplierId: String(attachment.supplier_id),
      attachmentId: attachment.id,
      file: existing?.file ?? null,
      fileName: attachment.file_name || existing?.fileName || "",
      previewUrl: existing?.previewUrl ?? null,
      isRecommended:
        existing?.isRecommended ?? Boolean(attachment.is_recommended),
      quotedTotal:
        attachment.quoted_total !== undefined && attachment.quoted_total !== null
          ? String(attachment.quoted_total)
          : existing?.quotedTotal || "",
      quoteReferenceNumber:
        attachment.quote_reference_number ??
        existing?.quoteReferenceNumber ??
        "",
    }
  })
}

function mergeServerAttachments(
  attachments: NonNullable<
    Awaited<
      ReturnType<
        ReturnType<typeof useRequisitionQuotesStore.getState>["fetchAttachments"]
      >
    >
  >,
  localQuotes: SupplierQuoteDraft[]
): SupplierQuoteDraft[] {
  const fromServer = mapAttachmentsToQuotes(attachments, localQuotes)
  const serverSupplierIds = new Set(fromServer.map((quote) => quote.supplierId))
  const serverAttachmentIds = new Set(
    fromServer
      .map((quote) => quote.attachmentId)
      .filter((id): id is number => typeof id === "number")
  )

  const localOnly = localQuotes.filter((quote) => {
    if (quote.attachmentId && serverAttachmentIds.has(quote.attachmentId)) {
      return false
    }

    if (quote.supplierId && serverSupplierIds.has(quote.supplierId)) {
      return Boolean(quote.file) && !quote.attachmentId
    }

    return Boolean(quote.file || quote.fileName || quote.supplierId)
  })

  return applyRecommendedSupplierDefaults([...fromServer, ...localOnly])
}

export function RequisitionSupplierQuotes({
  quotes,
  onChange,
  quoteWaiverReason = "",
  onQuoteWaiverReasonChange,
  requisitionId,
  requisitionTotal = 0,
  disabled = false,
  className,
  error,
}: RequisitionSupplierQuotesProps) {
  const fetchAttachments = useRequisitionQuotesStore(
    (state) => state.fetchAttachments
  )
  const deleteQuote = useRequisitionQuotesStore((state) => state.deleteQuote)
  const isLoading = useRequisitionQuotesStore((state) => state.isLoading)
  const storeError = useRequisitionQuotesStore((state) => state.error)

  const loadedForRequisitionRef = useRef<number | null>(null)
  const quotesRef = useRef(quotes)

  useEffect(() => {
    quotesRef.current = quotes
  }, [quotes])

  const emitChange = (nextQuotes: SupplierQuoteDraft[]) => {
    quotesRef.current = nextQuotes
    onChange(applyRecommendedSupplierDefaults(nextQuotes))
  }

  // Load existing attachments once when opening a requisition.
  useEffect(() => {
    if (!requisitionId) {
      return
    }

    if (loadedForRequisitionRef.current === requisitionId) {
      return
    }

    let cancelled = false
    loadedForRequisitionRef.current = requisitionId

    void fetchAttachments(requisitionId, true).then((attachments) => {
      if (cancelled || attachments === null || attachments.length === 0) {
        return
      }

      const local = quotesRef.current
      const localHasDocuments = local.some(
        (quote) => quote.file || quote.attachmentId || quote.fileName
      )

      if (localHasDocuments) {
        const usedAttachmentIds = new Set<number>()
        const patched = local.map((quote) => {
          const match = attachments.find(
            (attachment) =>
              quote.attachmentId === attachment.id ||
              (quote.supplierId !== "" &&
                String(attachment.supplier_id) === quote.supplierId)
          )
          if (!match) {
            return quote
          }
          usedAttachmentIds.add(match.id)
          return {
            ...quote,
            attachmentId: match.id,
            fileName: quote.fileName || match.file_name || "",
            file: quote.file,
            previewUrl: quote.previewUrl,
            isRecommended:
              quote.isRecommended || Boolean(match.is_recommended),
            quotedTotal:
              quote.quotedTotal ||
              (match.quoted_total != null ? String(match.quoted_total) : ""),
            quoteReferenceNumber:
              quote.quoteReferenceNumber ||
              match.quote_reference_number ||
              "",
          }
        })

        const extras = attachments
          .filter((attachment) => !usedAttachmentIds.has(attachment.id))
          .map((attachment) => mapAttachmentsToQuotes([attachment], [])[0])

        emitChange(applyRecommendedSupplierDefaults([...patched, ...extras]))
        return
      }

      emitChange(mergeServerAttachments(attachments, local))
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAttachments, requisitionId])

  const updateQuote = (clientId: string, nextQuote: SupplierQuoteDraft) => {
    const currentQuotes = quotesRef.current

    let nextQuotes: SupplierQuoteDraft[]
    if (nextQuote.isRecommended) {
      nextQuotes = currentQuotes.map((quote) =>
        quote.clientId === clientId
          ? nextQuote
          : { ...quote, isRecommended: false }
      )
    } else {
      nextQuotes = currentQuotes.map((quote) =>
        quote.clientId === clientId ? nextQuote : quote
      )
    }

    emitChange(nextQuotes)
  }

  const removeQuote = async (quote: SupplierQuoteDraft) => {
    if (quote.attachmentId) {
      const deleted = await deleteQuote(quote.attachmentId)
      if (!deleted) {
        return
      }
    }

    revokeSupplierQuotePreview(quote)
    emitChange(
      quotesRef.current.filter((item) => item.clientId !== quote.clientId)
    )
  }

  const addQuote = () => {
    emitChange([...quotesRef.current, createEmptySupplierQuote()])
  }

  const usedSupplierIds = quotes
    .map((quote) => quote.supplierId)
    .filter(Boolean)

  const completeQuoteCount = getCompleteSupplierQuotes(quotes).length
  const showRecommendedToggle =
    requisitionTotal >= SUPPLIER_QUOTE_HIGH_VALUE_THRESHOLD ||
    quotes.length > 1 ||
    completeQuoteCount > 1
  const showWaiverReason = needsQuoteWaiverReason(quotes, requisitionTotal)

  const visibleQuotes = disabled
    ? quotes.filter(
        (quote) => quote.attachmentId || quote.file || quote.fileName
      )
    : quotes

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            Supplier quotes
          </h3>
          <p className="text-xs text-muted-foreground">
            {disabled
              ? "Review the attached quotation PDFs. Use View to open a preview or Download to save a copy."
              : getSupplierQuoteRequirementMessage(requisitionTotal)}
          </p>
          {disabled && visibleQuotes.length > 0 ? (
            <p className="mt-1 text-xs font-medium text-primary">
              Quotation documents below are available to view and download.
            </p>
          ) : null}
          {!disabled && showRecommendedToggle ? (
            <p className="mt-1 text-xs font-medium text-emerald-700">
              Select one preferred supplier. The preferred quote is highlighted
              in green.
            </p>
          ) : null}
          {!disabled && !requisitionId ? (
            <p className="mt-1 text-xs text-amber-800">
              Save the draft once (or wait for autosave) before uploading quote
              PDFs so they can be stored on the server.
            </p>
          ) : null}
        </div>
        {!disabled ? (
          <UBButton type="button" variant="outline" size="sm" onClick={addQuote}>
            <Plus className="size-4" data-icon="inline-start" />
            Add quote
          </UBButton>
        ) : null}
      </div>

      {isLoading && visibleQuotes.length === 0 ? (
        <LoadingSpinner label="Loading supplier quotes..." />
      ) : visibleQuotes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/80 bg-muted/10 px-4 py-6 text-sm text-muted-foreground">
          {disabled
            ? "No supplier quotes are attached to this requisition."
            : 'No supplier quotes added yet. Use "Add quote" to upload a PDF and select a supplier.'}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleQuotes.map((quote) => (
            <SupplierQuoteRow
              key={quote.clientId}
              quote={quote}
              onChange={(nextQuote) => updateQuote(quote.clientId, nextQuote)}
              onRemove={() => void removeQuote(quote)}
              requisitionId={requisitionId}
              disabled={disabled}
              showRecommendedToggle={!disabled && showRecommendedToggle}
              excludeSupplierIds={usedSupplierIds.filter(
                (supplierId) => supplierId !== quote.supplierId
              )}
            />
          ))}
        </div>
      )}

      {showWaiverReason || (disabled && quoteWaiverReason.trim() !== "") ? (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900 dark:bg-amber-950/40">
          <label
            htmlFor="quote-waiver-reason"
            className="text-xs font-medium uppercase tracking-widest text-amber-900 dark:text-amber-100"
          >
            Reason for fewer than 3 quotes
          </label>
          <textarea
            id="quote-waiver-reason"
            value={quoteWaiverReason}
            onChange={(event) =>
              onQuoteWaiverReasonChange?.(event.target.value)
            }
            rows={3}
            disabled={disabled}
            placeholder="Explain why fewer than three supplier quotes are being submitted..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {!disabled ? (
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Required for requisitions of $
              {SUPPLIER_QUOTE_HIGH_VALUE_THRESHOLD.toLocaleString()} or more when
              fewer than three quotes are attached.
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {storeError ? (
        <p className="text-sm text-destructive">{storeError}</p>
      ) : null}
    </section>
  )
}
