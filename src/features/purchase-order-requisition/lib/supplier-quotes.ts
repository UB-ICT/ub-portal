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

export function getSupplierQuoteRequirementMessage(requisitionTotal: number) {
  const requiredCount = getRequiredQuoteCount(requisitionTotal)

  if (requiredCount === 1) {
    return "Requisitions under $1,000 require one supplier quote with a PDF. If you add more than one quote, select a preferred supplier."
  }

  return `Requisitions of $${SUPPLIER_QUOTE_HIGH_VALUE_THRESHOLD.toLocaleString()} or more require at least ${requiredCount} supplier quotes and one preferred supplier.`
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
  requisitionTotal: number
): string | null {
  const completeQuotes = getCompleteSupplierQuotes(quotes)
  const requiredCount = getRequiredQuoteCount(requisitionTotal)

  if (completeQuotes.length < requiredCount) {
    if (requiredCount === 1) {
      return "Add at least one supplier quote with a PDF file and supplier selected."
    }

    return `Requisitions of $${SUPPLIER_QUOTE_HIGH_VALUE_THRESHOLD.toLocaleString()} or more require at least ${requiredCount} supplier quotes with PDF files and suppliers selected.`
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
  requisitionTotal: number
) {
  return validateSupplierQuotes(quotes, requisitionTotal) === null
}

export function mapSupplierQuotesToPayload(quotes: SupplierQuoteDraft[]) {
  return applyRecommendedSupplierDefaults(quotes)
    .filter(isCompleteSupplierQuote)
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
  const [normalizedQuote] = applyRecommendedSupplierDefaults([quote])

  return {
    is_recommended: normalizedQuote.isRecommended,
    quoted_total: normalizedQuote.quotedTotal
      ? Number(normalizedQuote.quotedTotal)
      : null,
    quote_reference_number: normalizedQuote.quoteReferenceNumber.trim() || null,
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
