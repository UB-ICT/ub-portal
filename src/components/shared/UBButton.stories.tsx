import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowRight, Briefcase, GraduationCap, ShieldCheck } from "lucide-react"

import { UBButton, UBIconTileButton } from "./UBButton"

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

export const IconTile: Story = {
  render: () => (
    <UBIconTileButton
      label="Education"
      icon={<GraduationCap />}
      aria-label="Education"
    />
  ),
}

export const IconTileGroup: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <UBIconTileButton
        label="Education"
        icon={<GraduationCap />}
        aria-label="Education"
      />
      <UBIconTileButton
        label="Security"
        icon={<ShieldCheck />}
        aria-label="Security"
      />
      <UBIconTileButton
        label="Careers"
        icon={<Briefcase />}
        aria-label="Careers"
      />
    </div>
  ),
}
