export type PricedLineItemInput = {
  quantity: number
  total: number
  gst_applicable?: boolean
}

export type PricedLineItem = PricedLineItemInput & {
  unit_cost: number
  subtotal: number
  gst_amount: number
  total: number
}

export type LinePricingSummary = {
  items: PricedLineItem[]
  lines_subtotal: number
  gst_rate_percent: number
  gst_total: number
  total: number
}

export const DEFAULT_GST_RATE_PERCENT = 12.5

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateLinePricing(
  items: PricedLineItemInput[],
  gstRatePercent = DEFAULT_GST_RATE_PERCENT
): LinePricingSummary {
  let linesSubtotal = 0
  let gstTotal = 0
  let grandTotal = 0

  const prepared = items.map((item) => {
    const quantity = Number(item.quantity) || 0
    const subtotal = roundMoney(Number(item.total) || 0)
    const unitCost = quantity !== 0 ? subtotal / quantity : 0
    const gstApplicable = Boolean(item.gst_applicable)
    const gstAmount = gstApplicable
      ? roundMoney((subtotal * gstRatePercent) / 100)
      : 0
    const total = roundMoney(subtotal + gstAmount)

    linesSubtotal = roundMoney(linesSubtotal + subtotal)
    gstTotal = roundMoney(gstTotal + gstAmount)
    grandTotal = roundMoney(grandTotal + total)

    return {
      quantity,
      unit_cost: unitCost,
      subtotal,
      gst_applicable: gstApplicable,
      gst_amount: gstAmount,
      total,
    }
  })

  return {
    items: prepared,
    lines_subtotal: linesSubtotal,
    gst_rate_percent: gstRatePercent,
    gst_total: gstTotal,
    total: grandTotal,
  }
}
