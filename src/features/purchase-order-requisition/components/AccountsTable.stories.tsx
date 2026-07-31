import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"

import type { AccountTreeRow } from "../lib/account-admin-utils"
import { AccountsTable } from "./AccountsTable"

const mockAccounts: AccountTreeRow[] = [
  {
    id: 1,
    account_no: "70301",
    description: "Office Supplies",
    depth: 0,
  },
  {
    id: 4,
    parent_id: 1,
    account_no: "70301.1",
    description: "Printer Paper",
    parent: { id: 1, account_no: "70301", description: "Office Supplies" },
    depth: 1,
  },
  {
    id: 2,
    account_no: "70314",
    description: "Computer Supplies",
    depth: 0,
  },
  {
    id: 3,
    account_no: "70805",
    description: "Internet",
    depth: 0,
  },
]

const meta = {
  title: "Purchase Order Requisition/AccountsTable",
  component: AccountsTable,
  tags: ["autodocs"],
  args: {
    accounts: mockAccounts,
    isLoading: false,
    onEdit: () => undefined,
    onDelete: () => undefined,
  },
  parameters: componentParameters(
    "Nested chart of accounts table with indented child rows and edit/delete actions."
  ),
  decorators: [withPanel("max-w-4xl space-y-4 p-6")],
} satisfies Meta<typeof AccountsTable>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = {
  args: {
    accounts: [],
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    accounts: [],
    isLoading: false,
  },
}
