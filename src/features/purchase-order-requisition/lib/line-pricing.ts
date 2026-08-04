export type DiscountType = "none" | "percent" | "amount"

export type PricedLineItemInput = {
  quantity: number
  unit_cost: number
  gst_applicable?: boolean
}

export type PricedLineItem = PricedLineItemInput & {
  subtotal: number
  discount_amount: number
  gst_amount: number
  total: number
}

export type LinePricingSummary = {
  items: PricedLineItem[]
  lines_subtotal: number
  discount_type: DiscountType
  discount_value: number
  discount_amount: number
  gst_rate_percent: number
  gst_total: number
  total: number
}

export const DEFAULT_GST_RATE_PERCENT = 12.5

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Keep a line's discount share within its subtotal (supports credit/negative lines). */
function clampLineDiscount(lineDiscount: number, subtotal: number) {
  if (lineDiscount > 0) {
    return Math.min(lineDiscount, Math.max(subtotal, 0))
  }
  if (lineDiscount < 0) {
    return Math.max(lineDiscount, Math.min(subtotal, 0))
  }
  return 0
}

export function calculateLinePricing(
  items: PricedLineItemInput[],
  discountType: DiscountType = "none",
  discountValue = 0,
  gstRatePercent = DEFAULT_GST_RATE_PERCENT
): LinePricingSummary {
  const prepared = items.map((item) => {
    const quantity = Number(item.quantity) || 0
    const unitCost = Number(item.unit_cost) || 0
    const subtotal = roundMoney(quantity * unitCost)

    return {
      quantity,
      unit_cost: roundMoney(unitCost),
      subtotal,
      gst_applicable: Boolean(item.gst_applicable),
      discount_amount: 0,
      gst_amount: 0,
      total: subtotal,
    }
  })

  const linesSubtotal = roundMoney(
    prepared.reduce((sum, item) => sum + item.subtotal, 0)
  )

  let discountAmount = 0
  if (linesSubtotal > 0 && discountValue > 0) {
    if (discountType === "percent") {
      discountAmount = roundMoney((linesSubtotal * discountValue) / 100)
    } else if (discountType === "amount") {
      discountAmount = roundMoney(discountValue)
    }
    discountAmount = Math.min(discountAmount, linesSubtotal)
  }

  let allocated = 0
  let gstTotal = 0
  let grandTotal = 0

  prepared.forEach((line, index) => {
    let lineDiscount = 0
    if (prepared.length > 0) {
      if (index === prepared.length - 1) {
        lineDiscount = roundMoney(discountAmount - allocated)
      } else if (linesSubtotal > 0) {
        lineDiscount = roundMoney(
          discountAmount * (line.subtotal / linesSubtotal)
        )
        allocated = roundMoney(allocated + lineDiscount)
      }
    }

    lineDiscount = clampLineDiscount(lineDiscount, line.subtotal)
    const afterDiscount = roundMoney(line.subtotal - lineDiscount)
    const gstAmount = line.gst_applicable
      ? roundMoney((afterDiscount * gstRatePercent) / 100)
      : 0
    const total = roundMoney(afterDiscount + gstAmount)

    line.discount_amount = lineDiscount
    line.gst_amount = gstAmount
    line.total = total

    gstTotal = roundMoney(gstTotal + gstAmount)
    grandTotal = roundMoney(grandTotal + total)
  })

  return {
    items: prepared,
    lines_subtotal: linesSubtotal,
    discount_type: discountType === "none" ? "none" : discountType,
    discount_value: roundMoney(discountValue),
    discount_amount: discountAmount,
    gst_rate_percent: gstRatePercent,
    gst_total: gstTotal,
    total: grandTotal,
  }
}
