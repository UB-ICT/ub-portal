export type SupplierQuoteDraft = {
  clientId: string
  supplierId: string
  attachmentId?: number
  file: File | null
  fileName: string
  previewUrl: string | null
  isRecommended: boolean
  quotedTotal: string
  quoteReferenceNumber: string
}

export type SupplierQuoteUploadMeta = {
  is_recommended?: boolean
  quoted_total?: number | null
  quote_reference_number?: string | null
}

export const SUPPLIER_QUOTE_HIGH_VALUE_THRESHOLD = 1000

export function createEmptySupplierQuote(): SupplierQuoteDraft {
  return {
    clientId: crypto.randomUUID(),
    supplierId: "",
    file: null,
    fileName: "",
    previewUrl: null,
    isRecommended: false,
    quotedTotal: "",
    quoteReferenceNumber: "",
  }
}

export function isCompleteSupplierQuote(quote: SupplierQuoteDraft) {
  return (
    quote.supplierId !== "" && (quote.file !== null || quote.attachmentId)
  )
}

export function getCompleteSupplierQuotes(quotes: SupplierQuoteDraft[]) {
  return quotes.filter(isCompleteSupplierQuote)
}

export function getRequiredQuoteCount(requisitionTotal: number) {
  return requisitionTotal >= SUPPLIER_QUOTE_HIGH_VALUE_THRESHOLD ? 3 : 1
}

export function needsQuoteWaiverReason(
  quotes: SupplierQuoteDraft[],
  requisitionTotal: number
) {
  return (
    requisitionTotal >= SUPPLIER_QUOTE_HIGH_VALUE_THRESHOLD &&
    getCompleteSupplierQuotes(quotes).length <
      getRequiredQuoteCount(requisitionTotal)
  )
}

export function getSupplierQuoteRequirementMessage(requisitionTotal: number) {
  const requiredCount = getRequiredQuoteCount(requisitionTotal)

  if (requiredCount === 1) {
    return "Requisitions under $1,000 require one supplier quote with a PDF. If you add more than one quote, select a preferred supplier."
  }

  return `Requisitions of $${SUPPLIER_QUOTE_HIGH_VALUE_THRESHOLD.toLocaleString()} or more normally require at least ${requiredCount} supplier quotes and one preferred supplier. If fewer quotes are used, provide a reason.`
}

export function applyRecommendedSupplierDefaults(
  quotes: SupplierQuoteDraft[]
): SupplierQuoteDraft[] {
  const completeQuotes = getCompleteSupplierQuotes(quotes)

  if (completeQuotes.length !== 1) {
    return quotes
  }

  const recommendedSupplierId = completeQuotes[0].supplierId

  return quotes.map((quote) =>
    isCompleteSupplierQuote(quote) &&
    quote.supplierId === recommendedSupplierId
      ? { ...quote, isRecommended: true }
      : quote
  )
}

export function validateSupplierQuotes(
  quotes: SupplierQuoteDraft[],
  requisitionTotal: number,
  quoteWaiverReason = ""
): string | null {
  const completeQuotes = getCompleteSupplierQuotes(quotes)
  const requiredCount = getRequiredQuoteCount(requisitionTotal)
  const hasWaiver = quoteWaiverReason.trim() !== ""

  if (completeQuotes.length < 1) {
    return "Add at least one supplier quote with a PDF file and supplier selected."
  }

  if (completeQuotes.length < requiredCount && !hasWaiver) {
    if (requiredCount === 1) {
      return "Add at least one supplier quote with a PDF file and supplier selected."
    }

    return `Requisitions of $${SUPPLIER_QUOTE_HIGH_VALUE_THRESHOLD.toLocaleString()} or more require at least ${requiredCount} supplier quotes, or provide a reason for fewer quotes.`
  }

  if (
    completeQuotes.length > 1 &&
    completeQuotes.filter((quote) => quote.isRecommended).length !== 1
  ) {
    return "Select exactly one preferred supplier when multiple supplier quotes are submitted."
  }

  return null
}

export function isSupplierQuotesValid(
  quotes: SupplierQuoteDraft[],
  requisitionTotal: number,
  quoteWaiverReason = ""
) {
  return (
    validateSupplierQuotes(quotes, requisitionTotal, quoteWaiverReason) === null
  )
}

function mapQuoteToSupplierPayload(quote: SupplierQuoteDraft) {
  return {
    supplier_id: Number(quote.supplierId),
    is_recommended: quote.isRecommended,
    quoted_total: quote.quotedTotal ? Number(quote.quotedTotal) : null,
    quote_reference_number: quote.quoteReferenceNumber.trim() || null,
    attachment_id: quote.attachmentId ?? null,
  }
}

export function mapSupplierQuotesToPayload(quotes: SupplierQuoteDraft[]) {
  return applyRecommendedSupplierDefaults(quotes)
    .filter(isCompleteSupplierQuote)
    .map(mapQuoteToSupplierPayload)
}

/** Draft saves keep supplier selections even before a PDF is attached. */
export function mapDraftSupplierQuotesToPayload(quotes: SupplierQuoteDraft[]) {
  return applyRecommendedSupplierDefaults(quotes)
    .filter((quote) => quote.supplierId !== "")
    .map(mapQuoteToSupplierPayload)
}

type QuoteSourceSupplier = {
  id: number
  pivot?: {
    is_recommended?: boolean
    quoted_total?: number | string | null
    quote_reference_number?: string | null
  }
}

type QuoteSourceAttachment = {
  id: number
  supplier_id: number
  file_name?: string
  is_recommended?: boolean
  quoted_total?: number | string | null
  quote_reference_number?: string | null
}

function quoteFromSupplier(
  supplier: QuoteSourceSupplier,
  attachment?: QuoteSourceAttachment
): SupplierQuoteDraft {
  return {
    clientId: attachment
      ? `attachment-${attachment.id}`
      : `supplier-${supplier.id}`,
    supplierId: String(supplier.id),
    attachmentId: attachment?.id,
    file: null,
    fileName: attachment?.file_name ?? "",
    previewUrl: null,
    isRecommended: Boolean(supplier.pivot?.is_recommended),
    quotedTotal:
      supplier.pivot?.quoted_total != null
        ? String(supplier.pivot.quoted_total)
        : "",
    quoteReferenceNumber: supplier.pivot?.quote_reference_number ?? "",
  }
}

/**
 * Rebuild quote rows from the requisition pivot (selected suppliers) and
 * attach PDFs onto those rows. Leftover PDFs whose supplier was changed after
 * upload are bound 1:1 onto quotes that still have no file.
 */
export function mapRequisitionQuotesFromRecord(requisition: {
  suppliers?: QuoteSourceSupplier[]
  attachments?: QuoteSourceAttachment[]
}): SupplierQuoteDraft[] {
  const remainingAttachments = [...(requisition.attachments ?? [])]
  const suppliers = requisition.suppliers ?? []

  const quotes = suppliers.map((supplier) => {
    const attachmentIndex = remainingAttachments.findIndex(
      (attachment) => attachment.supplier_id === supplier.id
    )
    const attachment =
      attachmentIndex >= 0
        ? remainingAttachments.splice(attachmentIndex, 1)[0]
        : undefined

    return quoteFromSupplier(supplier, attachment)
  })

  for (const attachment of remainingAttachments) {
    const openQuote = quotes.find((quote) => !quote.attachmentId)

    if (openQuote) {
      openQuote.attachmentId = attachment.id
      openQuote.fileName = attachment.file_name || openQuote.fileName
      openQuote.clientId = `attachment-${attachment.id}`
      continue
    }

    quotes.push({
      clientId: `attachment-${attachment.id}`,
      supplierId: String(attachment.supplier_id),
      attachmentId: attachment.id,
      file: null,
      fileName: attachment.file_name ?? "",
      previewUrl: null,
      isRecommended: Boolean(attachment.is_recommended),
      quotedTotal:
        attachment.quoted_total != null ? String(attachment.quoted_total) : "",
      quoteReferenceNumber: attachment.quote_reference_number ?? "",
    })
  }

  return applyRecommendedSupplierDefaults(
    quotes.length > 0 ? quotes : [createEmptySupplierQuote()]
  )
}

export function mapSupplierQuoteToUploadMeta(
  quote: SupplierQuoteDraft
): SupplierQuoteUploadMeta {
  // Do not call applyRecommendedSupplierDefaults on a single quote — that
  // would force every uploaded file to is_recommended=true and wipe the
  // user's preferred-supplier choice when multiple quotes are synced.
  return {
    is_recommended: quote.isRecommended,
    quoted_total: quote.quotedTotal ? Number(quote.quotedTotal) : null,
    quote_reference_number: quote.quoteReferenceNumber.trim() || null,
  }
}

export function revokeSupplierQuotePreview(quote: SupplierQuoteDraft) {
  if (quote.previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(quote.previewUrl)
  }
}

export function revokeSupplierQuotePreviews(quotes: SupplierQuoteDraft[]) {
  quotes.forEach(revokeSupplierQuotePreview)
}
