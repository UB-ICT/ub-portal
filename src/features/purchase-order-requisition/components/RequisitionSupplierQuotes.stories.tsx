import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"
import type { Supplier } from "@/lib/api/suppliers"

import {
  createEmptySupplierQuote,
  type SupplierQuoteDraft,
} from "../lib/supplier-quotes"
import { RequisitionSupplierQuotes } from "./RequisitionSupplierQuotes"

const mockSuppliers: Supplier[] = [
  { id: 1, name: "Belize Office Depot", status_id: 3, status: { id: 3, name: "Approved" } },
  { id: 2, name: "Caribbean Tech Ltd.", status_id: 2, status: { id: 2, name: "Pending" } },
  { id: 3, name: "Quick Supply Co.", status_id: 5, status: { id: 5, name: "Under Review" } },
]

const meta = {
  title: "Purchase Order Requisition/RequisitionSupplierQuotes",
  component: RequisitionSupplierQuotes,
  tags: ["autodocs"],
  parameters: componentParameters(
    "Manage supplier quote PDFs for a requisition. Each row pairs one PDF with one supplier."
  ),
  decorators: [withPanel("max-w-5xl space-y-6 p-6")],
  beforeEach: () => {
    window.localStorage.setItem("ub-portal.access-token", "storybook-token")

    const { useSuppliersStore } = require("@/store/suppliers-store") as typeof import("@/store/suppliers-store")
    useSuppliersStore.setState({
      suppliers: mockSuppliers,
      isLoading: false,
      error: null,
    })
  },
} satisfies Meta<typeof RequisitionSupplierQuotes>

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {
  render: () => {
    const [quotes, setQuotes] = useState<SupplierQuoteDraft[]>([])

    return <RequisitionSupplierQuotes quotes={quotes} onChange={setQuotes} />
  },
}

export const WithDraftQuote: Story = {
  render: () => {
    const [quotes, setQuotes] = useState<SupplierQuoteDraft[]>([
      {
        ...createEmptySupplierQuote(),
        supplierId: "2",
        file: new File(["%PDF-1.4 sample"], "pending-vendor-quote.pdf", {
          type: "application/pdf",
        }),
        fileName: "pending-vendor-quote.pdf",
        previewUrl: null,
      },
    ])

    return <RequisitionSupplierQuotes quotes={quotes} onChange={setQuotes} />
  },
}

export const WithValidationError: Story = {
  render: () => {
    const [quotes, setQuotes] = useState<SupplierQuoteDraft[]>([
      createEmptySupplierQuote(),
    ])

    return (
      <RequisitionSupplierQuotes
        quotes={quotes}
        onChange={setQuotes}
        error="Add at least one supplier quote with a PDF file and supplier selected."
      />
    )
  },
}
