import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowRight, FilePlus2, ShieldCheck } from "lucide-react"
import { UBButton } from "./UBButton"

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

export const iconTextArrow: Story = {
  args: {
    className: "w-full",
    children: "New requisition",
    leadingIcon: "FilePlus2",
    trailingIcon: "ArrowRight",
    size: "xl",
    variant: "callout",
  },
  render: (args) => {
    const { leadingIcon, trailingIcon, ...buttonProps } = args

    return (
      <UBButton {...buttonProps}>
        {leadingIcon
          ? (() => {
              const LeadingIcon = buttonIcons[leadingIcon]

              return <LeadingIcon className="size-4" />
            })()
          : null}
        <span>{buttonProps.children}</span>
        {trailingIcon
          ? (() => {
              const TrailingIcon = buttonIcons[trailingIcon]

              return (
                <TrailingIcon className="size-4 transition-transform group-hover/button:translate-x-0.5" />
              )
            })()
          : null}
      </UBButton>
    )
  }

            return <LeadingIcon className="size-4" />
          })()
        : null}
      <span>{args.children}</span>
      {args.trailingIcon
        ? (() => {
            const TrailingIcon = buttonIcons[args.trailingIcon]

            return (
              <TrailingIcon className="size-4 transition-transform group-hover/button:translate-x-0.5" />
            )
          })()
        : null}
    </UBButton>
  ),
}
