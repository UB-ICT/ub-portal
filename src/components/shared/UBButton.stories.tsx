import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowRight, ShieldCheck } from "lucide-react"

import { UBButton } from "./UBButton"

const meta = {
  title: "Components/UBButton",
  component: UBButton,
  args: {
    children: "Continue",
    variant: "default",
    size: "default",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Base Storybook button for UB Portal. Storybook-facing components use the `UB` prefix.",
      },
    },
  },
} satisfies Meta<typeof UBButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Outline: Story = {
  args: {
    children: "Use Google SSO",
    variant: "outline",
  },
}

export const WithIcon: Story = {
  render: (args) => (
    <UBButton {...args}>
      <ShieldCheck />
      Secure sign in
    </UBButton>
  ),
}

export const IconOnly: Story = {
  args: {
    "aria-label": "Continue",
    size: "icon",
  },
  render: (args) => (
    <UBButton {...args}>
      <ArrowRight />
    </UBButton>
  ),
}
