import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState, type ReactNode } from "react"

import {
  actionArgTypes,
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"
import type { Supplier } from "@/lib/api/suppliers"

import { SupplierQuoteSelect } from "./SupplierQuoteSelect"

const mockSuppliers: Supplier[] = [
  { id: 1, name: "Belize Office Depot", status_id: 3, status: { id: 3, name: "Approved" } },
  { id: 2, name: "Caribbean Tech Ltd.", status_id: 2, status: { id: 2, name: "Pending" } },
  { id: 3, name: "Quick Supply Co.", status_id: 4, status: { id: 4, name: "Rejected" } },
]

const meta = {
  title: "Purchase Order Requisition/SupplierQuoteSelect",
  component: SupplierQuoteSelect,
  tags: ["autodocs"],
  argTypes: {
    ...actionArgTypes,
    label: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
  },
  parameters: componentParameters(
    "Supplier picker for quote uploads. Unapproved suppliers appear struck through with a not approved label."
  ),
  decorators: [withPanel("max-w-md space-y-6 p-6")],
  beforeEach: () => {
    window.localStorage.setItem("ub-portal.access-token", "storybook-token")
  },
} satisfies Meta<typeof SupplierQuoteSelect>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("")

    return (
      <StorybookSuppliersProvider suppliers={mockSuppliers}>
        <SupplierQuoteSelect {...args} value={value} onValueChange={setValue} />
      </StorybookSuppliersProvider>
    )
  },
  args: {
    label: "Supplier",
  },
}

export const WithSelection: Story = {
  render: (args) => {
    const [value, setValue] = useState("2")

    return (
      <StorybookSuppliersProvider suppliers={mockSuppliers}>
        <SupplierQuoteSelect {...args} value={value} onValueChange={setValue} />
      </StorybookSuppliersProvider>
    )
  },
  args: {
    label: "Supplier",
  },
}

function StorybookSuppliersProvider({
  suppliers,
  children,
}: {
  suppliers: Supplier[]
  children: ReactNode
}) {
  const useSuppliersStore = require("@/store/suppliers-store")
    .useSuppliersStore as typeof import("@/store/suppliers-store").useSuppliersStore

  useSuppliersStore.setState({
    suppliers,
    isLoading: false,
    error: null,
  })

  return children
}
