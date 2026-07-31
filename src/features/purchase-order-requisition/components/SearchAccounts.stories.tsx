import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"

import { SearchAccounts } from "./SearchAccounts"

const meta = {
  title: "Purchase Order Requisition/SearchAccounts",
  component: SearchAccounts,
  tags: ["autodocs"],
  args: {
    onSearch: () => undefined,
  },
  parameters: componentParameters(
    "Search and sort controls for the accounts admin list."
  ),
  decorators: [withPanel("max-w-4xl space-y-4 p-6")],
} satisfies Meta<typeof SearchAccounts>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
