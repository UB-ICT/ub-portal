import type { Meta, StoryObj } from "@storybook/react-vite"

import { UBHeaderPortal } from "./UBHeaderPortal"

const meta = {
  title: "Components/UBHeaderPortal",
  component: UBHeaderPortal,
  args: {
    userName: "Luis Herrera",
    notificationCount: 6,
    onThemeToggle: () => undefined,
    onNotificationsClick: () => undefined,
    onAppsClick: () => undefined,
    onProfileClick: () => undefined,
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Portal header variant with logo/title + search on the left, and theme toggle, notifications, app launcher, and user profile on the right.",
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
} satisfies Meta<typeof UBHeaderPortal>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithProfileImage: Story = {
  args: {
    userImageSrc:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
    notificationCount: 2,
  },
}

export const ZeroNotifications: Story = {
  args: {
    notificationCount: 0,
  },
}
