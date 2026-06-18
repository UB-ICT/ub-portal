import { Plus } from "lucide-react"
import { useEffect, useRef } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { cn } from "@/lib/utils"
import { useRequisitionQuotesStore } from "@/store/requisition-quotes-store"

import {
  createEmptySupplierQuote,
  revokeSupplierQuotePreview,
  type SupplierQuoteDraft,
} from "../lib/supplier-quotes"
import { SupplierQuoteRow } from "./SupplierQuoteRow"

type RequisitionSupplierQuotesProps = {
  quotes: SupplierQuoteDraft[]
  onChange: (quotes: SupplierQuoteDraft[]) => void
  requisitionId?: number
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
  requisitionId,
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

  useEffect(() => {
    hasLoadedAttachments.current = false
  }, [requisitionId])

  useEffect(() => {
    if (!requisitionId || hasLoadedAttachments.current) {
      return
    }

    void fetchAttachments(requisitionId).then((attachments) => {
      hasLoadedAttachments.current = true
      onChange(
        attachments.length > 0
          ? mapAttachmentsToQuotes(attachments)
          : [createEmptySupplierQuote()]
      )
    })
  }, [fetchAttachments, onChange, requisitionId])

  const updateQuote = (clientId: string, nextQuote: SupplierQuoteDraft) => {
    if (nextQuote.isRecommended) {
      onChange(
        quotes.map((quote) =>
          quote.clientId === clientId
            ? nextQuote
            : { ...quote, isRecommended: false }
        )
      )
      return
    }

    onChange(
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
    onChange(quotes.filter((item) => item.clientId !== quote.clientId))
  }

  const addQuote = () => {
    onChange([...quotes, createEmptySupplierQuote()])
  }

  const usedSupplierIds = quotes
    .map((quote) => quote.supplierId)
    .filter(Boolean)

  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            Supplier quotes
          </h3>
          <p className="text-xs text-muted-foreground">
            Upload a PDF quote and assign a supplier for each vendor option.
          </p>
        </div>
        <UBButton
          type="button"
          variant="outline"
          size="sm"
          onClick={addQuote}
          disabled={disabled || isLoading}
        >
          <Plus className="size-4" data-icon="inline-start" />
          Add quote
        </UBButton>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/80 bg-muted/10 px-4 py-6 text-sm text-muted-foreground">
          No supplier quotes added yet. Use &quot;Add quote&quot; to upload a PDF
          and select a supplier.
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map((quote) => (
            <SupplierQuoteRow
              key={quote.clientId}
              quote={quote}
              onChange={(nextQuote) => updateQuote(quote.clientId, nextQuote)}
              onRemove={() => void removeQuote(quote)}
              disabled={disabled || isLoading}
              excludeSupplierIds={usedSupplierIds.filter(
                (supplierId) => supplierId !== quote.supplierId
              )}
            />
          ))}
        </div>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {storeError ? (
        <p className="text-sm text-destructive">{storeError}</p>
      ) : null}
    </section>
  )
}
