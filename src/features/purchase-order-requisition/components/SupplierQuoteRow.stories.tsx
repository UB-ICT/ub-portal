import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"
import type { Supplier } from "@/lib/api/suppliers"

import { createEmptySupplierQuote } from "../lib/supplier-quotes"
import { SupplierQuoteRow } from "./SupplierQuoteRow"

const mockSuppliers: Supplier[] = [
  { id: 1, name: "Belize Office Depot", status_id: 3, status: { id: 3, name: "Approved" } },
  { id: 2, name: "Caribbean Tech Ltd.", status_id: 2, status: { id: 2, name: "Pending" } },
]

const meta = {
  title: "Purchase Order Requisition/SupplierQuoteRow",
  component: SupplierQuoteRow,
  tags: ["autodocs"],
  parameters: componentParameters(
    "Single supplier quote row with PDF upload, supplier selection, inline preview, and remove actions."
  ),
  decorators: [withPanel("max-w-4xl space-y-6 p-6")],
  beforeEach: () => {
    window.localStorage.setItem("ub-portal.access-token", "storybook-token")

    const { useSuppliersStore } = require("@/store/suppliers-store") as typeof import("@/store/suppliers-store")
    useSuppliersStore.setState({
      suppliers: mockSuppliers,
      isLoading: false,
      error: null,
    })
  },
} satisfies Meta<typeof SupplierQuoteRow>

export default meta

type Story = StoryObj<typeof meta>

export const EmptyRow: Story = {
  render: () => {
    const [quote, setQuote] = useState(createEmptySupplierQuote())

    return (
      <SupplierQuoteRow
        quote={quote}
        onChange={setQuote}
        onRemove={() => undefined}
      />
    )
  },
}

export const WithPdfAndUnapprovedSupplier: Story = {
  render: () => {
    const [quote, setQuote] = useState({
      ...createEmptySupplierQuote(),
      supplierId: "2",
      quoteReferenceNumber: "Q-2026-0142",
      quotedTotal: "1250.00",
      isRecommended: true,
      file: new File(["%PDF-1.4 sample"], "vendor-quote.pdf", {
        type: "application/pdf",
      }),
      fileName: "vendor-quote.pdf",
      previewUrl: null,
    })

    return (
      <SupplierQuoteRow
        quote={quote}
        onChange={setQuote}
        onRemove={() => undefined}
      />
    )
  },
}
