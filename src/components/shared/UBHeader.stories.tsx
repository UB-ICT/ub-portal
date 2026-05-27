import type { Meta, StoryObj } from "@storybook/react-vite"

import { UBHeader } from "./UBHeader"

const meta = {
  title: "Components/UBHeader",
  component: UBHeader,
  args: {
    userName: "Luis Herrera",
    userEmail: "luis.herrera@ub.edu.bz",
    isLoggingOut: false,
    onLogout: () => undefined,
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Shared authenticated header for UB Portal layouts, including account context, theme toggle, and sign-out action.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="-m-6 min-h-svh bg-muted/30">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UBHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SigningOut: Story = {
  args: {
    isLoggingOut: true,
  },
}

export const LongIdentity: Story = {
  args: {
    userName: "Luis Mauricio Herrera",
    userEmail: "luis.herrera@ub.edu.bz",
  },
}
