import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"
import type { ChartOfAccount } from "@/lib/api/chart-of-accounts"
import { useChartOfAccountsStore } from "@/store/chart-of-accounts-store"

import { AccountFormDialog } from "./AccountFormDialog"

const meta = {
  title: "Purchase Order Requisition/AccountFormDialog",
  component: AccountFormDialog,
  tags: ["autodocs"],
  args: {
    open: true,
    account: null,
    onOpenChange: () => undefined,
    onSuccess: () => undefined,
  },
  parameters: componentParameters(
    "Dialog for creating or editing an account number and description."
  ),
  decorators: [withPanel("max-w-lg space-y-4 p-6")],
  beforeEach: () => {
    useChartOfAccountsStore.setState({
      chartOfAccounts: [],
      isLoading: false,
      isSaving: false,
      error: null,
      createChartOfAccount: async (payload) => ({
        id: 99,
        account_no: payload.account_no,
        description: payload.description,
      }),
      updateChartOfAccount: async (id, payload) => ({
        id,
        account_no: payload.account_no,
        description: payload.description,
      }),
      deleteChartOfAccount: async () => true,
      fetchChartOfAccounts: async () => [],
      reset: () => undefined,
    })
  },
} satisfies Meta<typeof AccountFormDialog>

export default meta

type Story = StoryObj<typeof meta>

export const Create: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true)

    return (
      <AccountFormDialog
        {...args}
        open={open}
        account={null}
        onOpenChange={setOpen}
      />
    )
  },
}

export const Edit: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true)
    const account: ChartOfAccount = {
      id: 1,
      account_no: "70301",
      description: "Office Supplies",
    }

    return (
      <AccountFormDialog
        {...args}
        open={open}
        account={account}
        onOpenChange={setOpen}
      />
    )
  },
}
