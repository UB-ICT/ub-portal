import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  actionArgTypes,
  clickButton,
  componentParameters,
  expectTextVisible,
  withFullscreenCanvas,
  withRouter,
} from "@/components/shared/storybook"

import { UBHeader } from "./UBHeader"

const mockApplications = [
  {
    id: "1",
    label: "Education",
    path: "/education",
    icon: "BookOpen",
    sort_order: 1,
  },
  {
    id: "2",
    label: "Requisitions",
    path: "/requisitions",
    icon: "ClipboardList",
    sort_order: 2,
  },
  {
    id: "3",
    label: "Registration",
    path: "/registration",
    icon: "LayoutGrid",
    sort_order: 3,
  },
  {
    id: "4",
    label: "Reports",
    path: "/reports",
    icon: "Grid3X3",
    sort_order: 4,
  },
]

const meta = {
  title: "Components/UBHeader",
  component: UBHeader,
  tags: ["autodocs"],
  args: {
    userName: "Luis Herrera",
    userEmail: "luis.herrera@ub.edu.bz",
    notificationCount: 6,
    applications: mockApplications,
    onThemeToggle: () => undefined,
    onNotificationsClick: () => undefined,
    onAppsClick: () => undefined,
    onProfileClick: () => undefined,
    onViewProfile: () => undefined,
    onSettingsClick: () => undefined,
    onConnectUsersClick: () => undefined,
    onAdminToolsClick: () => undefined,
    onGoogleSettingsClick: () => undefined,
    onSignOutClick: () => undefined,
  },
  argTypes: {
    ...actionArgTypes,
    userName: { control: "text" },
    userEmail: { control: "text" },
    notificationCount: { control: "number" },
    showAdminActions: { control: "boolean" },
  },
  parameters: componentParameters(
    "Portal header variant with logo/title + search on the left, and theme toggle, notifications, app launcher, and user profile on the right.",
    "fullscreen"
  ),
  decorators: [withRouter(), withFullscreenCanvas()],
} satisfies Meta<typeof UBHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expectTextVisible(canvasElement, "Luis Herrera")
    await clickButton(canvasElement, /apps|application/i)
  },
}

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

export const AdminUser: Story = {
  args: {
    showAdminActions: true,
    userName: "Maria Castillo",
    userEmail: "maria.castillo@ub.edu.bz",
    notificationCount: 9,
  },
}
