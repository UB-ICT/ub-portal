import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"

import {
  createEmptyLineItem,
  RequisitionLineItemsTable,
  type RequisitionLineItemDraft,
} from "./RequisitionLineItemsTable"

const sampleItems: RequisitionLineItemDraft[] = [
  {
    id: "item-1",
    line_item_number: "ICT-001",
    description: "27-inch 4K Development Monitors",
    quantity: 5,
    unit_cost: 350,
    comments: "Dell preferred",
  },
  {
    id: "item-2",
    line_item_number: "ICT-014",
    description: "Mechanical Keyboards",
    quantity: 10,
    unit_cost: 85,
    comments: "",
  },
  {
    id: "item-3",
    line_item_number: "LAB-003",
    description: "USB-C Docking Stations",
    quantity: 6,
    unit_cost: 130,
    comments: "Dual display support",
  },
]

const meta = {
  title: "Purchase Order Requisition/RequisitionLineItemsTable",
  component: RequisitionLineItemsTable,
  tags: ["autodocs"],
  parameters: componentParameters(
    "Editable line items table for requisitions with optional alternating row backgrounds."
  ),
  decorators: [withPanel("max-w-5xl space-y-6 p-6")],
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
  render: (args) => {
    const [items, setItems] = useState(sampleItems)

    return (
      <RequisitionLineItemsTable
        {...args}
        items={items}
        onChange={setItems}
      />
    )
  },
}

export const StripedRowsDisabled: Story = {
  args: {
    stripedRows: false,
  },
  render: (args) => {
    const [items, setItems] = useState(sampleItems)

    return (
      <RequisitionLineItemsTable
        {...args}
        items={items}
        onChange={setItems}
      />
    )
  },
}

export const SubmittedNoNewItems: Story = {
  args: {
    allowAddItems: false,
    stripedRows: true,
  },
  render: (args) => {
    const [items, setItems] = useState(sampleItems)

    return (
      <RequisitionLineItemsTable
        {...args}
        items={items}
        onChange={setItems}
      />
    )
  },
}

export const Empty: Story = {
  render: (args) => {
    const [items, setItems] = useState<RequisitionLineItemDraft[]>([
      createEmptyLineItem(),
    ])

    return (
      <RequisitionLineItemsTable
        {...args}
        items={items}
        onChange={setItems}
      />
    )
  },
}

export const ReadOnly: Story = {
  args: {
    disabled: true,
    allowAddItems: false,
    stripedRows: true,
  },
  render: (args) => {
    const [items] = useState(sampleItems)

    return (
      <RequisitionLineItemsTable
        {...args}
        items={items}
        onChange={() => undefined}
      />
    )
  },
}
