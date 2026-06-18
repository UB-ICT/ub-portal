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

export function isSupplierQuotesValid(quotes: SupplierQuoteDraft[]) {
  return (
    quotes.length > 0 &&
    quotes.every(
      (quote) =>
        quote.supplierId !== "" && (quote.file !== null || quote.attachmentId)
    )
  )
}

export function mapSupplierQuotesToPayload(quotes: SupplierQuoteDraft[]) {
  return quotes
    .filter((quote) => quote.supplierId)
    .map((quote) => ({
      supplier_id: Number(quote.supplierId),
      is_recommended: quote.isRecommended,
      quoted_total: quote.quotedTotal ? Number(quote.quotedTotal) : null,
      quote_reference_number: quote.quoteReferenceNumber.trim() || null,
    }))
}

export function mapSupplierQuoteToUploadMeta(
  quote: SupplierQuoteDraft
): SupplierQuoteUploadMeta {
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
