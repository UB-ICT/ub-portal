import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowRight, Briefcase, GraduationCap, FilePlus2, ShieldCheck } from "lucide-react"
import { UBButton, UBIconTileButton } from "./UBButton"

const buttonIcons = {
  ArrowRight,
  FilePlus2,
  ShieldCheck,
} as const

type ButtonIconName = keyof typeof buttonIcons
type ButtonStoryArgs = React.ComponentProps<typeof UBButton> & {
  leadingIcon?: ButtonIconName
  trailingIcon?: ButtonIconName
}

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
} satisfies Meta<ButtonStoryArgs>

export default meta

type Story = StoryObj<ButtonStoryArgs>

export const Default: Story = {}

export const Outline: Story = {
  args: {
    children: "Use Google SSO",
    variant: "outline",
  },
}

export const WithIcon: Story = {
  args: {
    children: "Continue",
  },

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
