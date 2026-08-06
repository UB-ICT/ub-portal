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
  attachments: Awaited<
    ReturnType<
      ReturnType<typeof useRequisitionQuotesStore.getState>["fetchAttachments"]
    >
  >
): SupplierQuoteDraft[] {
  return attachments.map((attachment) => ({
    clientId: `attachment-${attachment.id}`,
    supplierId: String(attachment.supplier_id),
    attachmentId: attachment.id,
    file: null,
    fileName: attachment.file_name,
    previewUrl: null,
    isRecommended: Boolean(attachment.is_recommended),
    quotedTotal:
      attachment.quoted_total !== undefined && attachment.quoted_total !== null
        ? String(attachment.quoted_total)
        : "",
    quoteReferenceNumber: attachment.quote_reference_number ?? "",
  }))
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

  const hasLoadedAttachments = useRef(false)
  const quotesRef = useRef(quotes)
  quotesRef.current = quotes

  const emitChange = (nextQuotes: SupplierQuoteDraft[]) => {
    onChange(applyRecommendedSupplierDefaults(nextQuotes))
  }

  useEffect(() => {
    hasLoadedAttachments.current = false
  }, [requisitionId])

  useEffect(() => {
    if (!requisitionId || hasLoadedAttachments.current) {
      return
    }

    void fetchAttachments(requisitionId, true).then((attachments) => {
      hasLoadedAttachments.current = true

      const localQuotes = quotesRef.current
      // Server attachments are authoritative. Keep only local work that is not
      // already on the server. Drop stale rows whose attachmentId was deleted
      // (e.g. old autosave duplicates still sitting in localStorage drafts).
      const pendingOrUnsynced = localQuotes.filter((quote) => {
        if (quote.attachmentId) {
          return false
        }

        if (quote.file && quote.supplierId) {
          return !attachments.some(
            (attachment) => String(attachment.supplier_id) === quote.supplierId
          )
        }

        if (!quote.supplierId) {
          return false
        }

        // Supplier chosen locally but no uploaded quote for that supplier yet.
        return !attachments.some(
          (attachment) => String(attachment.supplier_id) === quote.supplierId
        )
      })

      if (attachments.length > 0) {
        emitChange([
          ...mapAttachmentsToQuotes(attachments),
          ...pendingOrUnsynced,
        ])
        return
      }

      if (
        pendingOrUnsynced.length > 0 ||
        localQuotes.some((quote) => quote.supplierId || quote.attachmentId)
      ) {
        emitChange(
          pendingOrUnsynced.length > 0 ? pendingOrUnsynced : localQuotes
        )
        return
      }

      // Read-only viewers should not get an empty upload row.
      emitChange(disabled ? [] : [createEmptySupplierQuote()])
    })
  }, [disabled, fetchAttachments, onChange, requisitionId])

  const updateQuote = (clientId: string, nextQuote: SupplierQuoteDraft) => {
    if (nextQuote.isRecommended) {
      emitChange(
        quotes.map((quote) =>
          quote.clientId === clientId
            ? nextQuote
            : { ...quote, isRecommended: false }
        )
      )
      return
    }

    emitChange(
      quotes.map((quote) => (quote.clientId === clientId ? nextQuote : quote))
    )
  }

  const removeQuote = async (quote: SupplierQuoteDraft) => {
    if (quote.attachmentId) {
      const deleted = await deleteQuote(quote.attachmentId)

      if (!deleted) {
        return
      }
    }

    revokeSupplierQuotePreview(quote)
    emitChange(quotes.filter((item) => item.clientId !== quote.clientId))
  }

  const addQuote = () => {
    emitChange([...quotes, createEmptySupplierQuote()])
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
        </div>
        {!disabled ? (
          <UBButton
            type="button"
            variant="outline"
            size="sm"
            onClick={addQuote}
            disabled={isLoading}
          >
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
              disabled={disabled || isLoading}
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
            disabled={disabled || isLoading}
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
