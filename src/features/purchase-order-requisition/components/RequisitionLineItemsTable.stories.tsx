import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState, type ComponentProps } from "react"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"
import type { ChartOfAccount } from "@/lib/api/chart-of-accounts"

import {
  createEmptyLineItem,
  RequisitionLineItemsTable,
  type RequisitionLineItemDraft,
} from "./RequisitionLineItemsTable"

const sampleAccounts: ChartOfAccount[] = [
  {
    id: 1,
    account_no: "70314",
    description: "Computer Supplies",
  },
  {
    id: 2,
    account_no: "70315",
    description: "Other Office Equipment",
  },
  {
    id: 3,
    account_no: "70523",
    description: "Maintenance of Computer Hardware",
  },
]

const sampleItems: RequisitionLineItemDraft[] = [
  {
    id: "item-1",
    chart_of_account_id: 1,
    account_no: "70314",
    description: "Computer Supplies",
    quantity: 5,
    unit_cost: 350,
    total: 1750,
    gst_applicable: true,
    comments: "Dell preferred",
  },
  {
    id: "item-2",
    chart_of_account_id: 2,
    account_no: "70315",
    description: "Other Office Equipment",
    quantity: 10,
    unit_cost: 85,
    total: 850,
    gst_applicable: false,
    comments: "",
  },
  {
    id: "item-3",
    chart_of_account_id: 3,
    account_no: "70523",
    description: "Maintenance of Computer Hardware",
    quantity: 6,
    unit_cost: 130,
    total: 780,
    gst_applicable: true,
    comments: "Dual display support",
  },
]

function StoryTable(
  props: Omit<
    ComponentProps<typeof RequisitionLineItemsTable>,
    "items" | "onChange" | "budgetAccounts"
  > & {
    initialItems?: RequisitionLineItemDraft[]
  }
) {
  const { initialItems = sampleItems, ...args } = props
  const [items, setItems] = useState(initialItems)

  return (
    <RequisitionLineItemsTable
      {...args}
      items={items}
      onChange={setItems}
      budgetAccounts={sampleAccounts}
    />
  )
}

const meta = {
  title: "Purchase Order Requisition/RequisitionLineItemsTable",
  component: RequisitionLineItemsTable,
  tags: ["autodocs"],
  parameters: componentParameters(
    "Editable line items: quantity and total in, unit cost and GST computed."
  ),
  decorators: [withPanel("max-w-6xl space-y-6 p-6")],
  argTypes: {
    stripedRows: {
      control: "boolean",
      description: "Alternate background color on even and odd rows.",
    },
    allowAddItems: {
      control: "boolean",
      description: "Show the add line item action.",
    },
    disabled: {
      control: "boolean",
      description: "Disable all line item inputs and actions.",
    },
  },
  args: {
    stripedRows: true,
    allowAddItems: true,
    disabled: false,
  },
} satisfies Meta<typeof RequisitionLineItemsTable>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <StoryTable {...args} />,
}

export const StripedRowsDisabled: Story = {
  args: {
    stripedRows: false,
  },
  render: (args) => <StoryTable {...args} />,
}

export const SubmittedNoNewItems: Story = {
  args: {
    allowAddItems: false,
    stripedRows: true,
  },
  render: (args) => <StoryTable {...args} />,
}

export const Empty: Story = {
  render: (args) => (
    <StoryTable {...args} initialItems={[createEmptyLineItem()]} />
  ),
}

export const ReadOnly: Story = {
  args: {
    disabled: true,
    allowAddItems: false,
    stripedRows: true,
  },
  render: (args) => <StoryTable {...args} />,
}
