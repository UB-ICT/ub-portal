import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  ClipboardList,
  FileCheck2,
  GraduationCap,
  House,
  Settings,
} from "lucide-react"

import { UBMenu } from "./UBMenu"

const meta = {
  title: "Components/UBMenu",
  component: UBMenu,
  args: {
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <House className="size-4" />,
        href: "#dashboard",
      },
      {
        id: "education",
        label: "Education",
        icon: <GraduationCap className="size-4" />,
        href: "#education",
      },
      {
        id: "requisitions",
        label: "Requisitions",
        icon: <ClipboardList className="size-4" />,
        href: "#requisitions",
        active: true,
      },
      {
        id: "approvals",
        label: "Approvals",
        icon: <FileCheck2 className="size-4" />,
        href: "#approvals",
      },
      {
        id: "settings",
        label: "Settings",
        icon: <Settings className="size-4" />,
        href: "#settings",
      },
    ],
    brandTitle: "UB Portal",
    brandDescription: "One platform for campus services, forms, and approvals.",
    privacyHref: "#privacy",
    termsHref: "#terms",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Sidebar menu with full-width icon text navigation buttons and branded footer section with policy links.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-[40rem] w-80 p-6">
        <Story />
      </div>
    ),
      </div>
    ),
  ],
} satisfies Meta<typeof UBMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const RegistrationMenu: Story = {
  args: {
    items: [
      {
        id: "home",
        label: "Home",
        icon: <House className="size-4" />,
        href: "#home",
      },
      {
        id: "education",
        label: "Education",
        icon: <GraduationCap className="size-4" />,
        href: "#education",
        active: true,
      },
      {
        id: "forms",
        label: "Requisitions",
        icon: <ClipboardList className="size-4" />,
        href: "#forms",
      },
      {
        id: "approvals",
        label: "Approvals",
        icon: <FileCheck2 className="size-4" />,
        href: "#approvals",
      },
      {
        id: "settings",
        label: "Settings",
        icon: <Settings className="size-4" />,
        href: "#settings",
      },
    ],
    brandTitle: "UB Registration Hub",
    brandDescription: "Enroll, submit, and track everything in one place.",
  },
}
