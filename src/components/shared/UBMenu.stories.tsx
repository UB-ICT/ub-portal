import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  actionArgTypes,
  clickLink,
  componentParameters,
  expectTextVisible,
  withPanel,
  withSidebarWidth,
} from "@/components/shared/storybook"
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
  tags: ["autodocs"],
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
  argTypes: {
    ...actionArgTypes,
    brandTitle: { control: "text" },
    brandDescription: { control: "text" },
    privacyHref: { control: "text" },
    termsHref: { control: "text" },
  },
  parameters: componentParameters(
    "Sidebar menu with full-width icon text navigation buttons and branded footer section with policy links."
  ),
  decorators: [withPanel("min-h-[40rem] p-6"), withSidebarWidth("w-80")],
} satisfies Meta<typeof UBMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expectTextVisible(canvasElement, "UB Portal")
    await clickLink(canvasElement, "Dashboard")
  },
}

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
