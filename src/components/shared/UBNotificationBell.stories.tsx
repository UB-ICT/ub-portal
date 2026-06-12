import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  actionArgTypes,
  componentParameters,
  expectButtonVisible,
  withPanel,
} from "@/components/shared/storybook"

import { UBNotificationBell } from "./UBNotificationBell"

const meta = {
  title: "Components/UBNotificationBell",
  component: UBNotificationBell,
  tags: ["autodocs"],
  args: {
    notificationCount: 4,
  },
  argTypes: {
    ...actionArgTypes,
    notificationCount: { control: "number" },
  },
  parameters: componentParameters(
    "Notification bell button with a badge showing the number of new notifications since the user last checked."
  ),
  decorators: [withPanel("p-6")],
} satisfies Meta<typeof UBNotificationBell>

export default meta

type Story = StoryObj<typeof meta>

export const WithNotifications: Story = {
  play: async ({ canvasElement }) => {
    await expectButtonVisible(canvasElement, /notification/i)
  },
}

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
