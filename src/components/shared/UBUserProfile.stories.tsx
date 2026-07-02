import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  componentParameters,
  expectTextVisible,
  withMaxWidth,
  withPanel,
} from "@/components/shared/storybook"

import { UBUserProfile } from "./UBUserProfile"

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
]

const meta = {
  title: "Components/UBUserProfile",
  component: UBUserProfile,
  tags: ["autodocs"],
  args: {
    userName: "Luis Herrera",
    userEmail: "luis.herrera@ub.edu.bz",
    role: "Admin Console",
    statusLabel: "Active",
    mailingGroups: ["Finance", "Procurement"],
    applications: mockApplications,
  },
  argTypes: {
    userName: { control: "text" },
    userEmail: { control: "text" },
    role: { control: "text" },
    statusLabel: { control: "text" },
  },
  parameters: componentParameters(
    "Read-only profile summary showing a user's identity, mailing groups, and the applications they can access."
  ),
  decorators: [withPanel("p-6"), withMaxWidth("max-w-xl")],
} satisfies Meta<typeof UBUserProfile>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expectTextVisible(canvasElement, "Luis Herrera")
    await expectTextVisible(canvasElement, "Finance")
  },
}

export const WithProfileImage: Story = {
  args: {
    userImageSrc:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
  },
}

export const NoMailingGroupsOrApps: Story = {
  args: {
    userName: "Maria Castillo",
    userEmail: "maria.castillo@ub.edu.bz",
    mailingGroups: [],
    applications: [],
  },
}
