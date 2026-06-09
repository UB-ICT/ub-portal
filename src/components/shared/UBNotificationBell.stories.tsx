import type { Meta, StoryObj } from "@storybook/react-vite"

import { UBNotificationBell } from "./UBNotificationBell"

const meta = {
  title: "Components/UBNotificationBell",
  component: UBNotificationBell,
  args: {
    notificationCount: 4,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Notification bell button with a badge showing the number of new notifications since the user last checked.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UBNotificationBell>

export default meta

type Story = StoryObj<typeof meta>

export const WithNotifications: Story = {}

export const NoNotifications: Story = {
  args: {
    notificationCount: 0,
  },
}

export const ManyNotifications: Story = {
  args: {
    notificationCount: 128,
  },
}
