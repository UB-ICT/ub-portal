import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  actionArgTypes,
  clickButton,
  componentParameters,
  expectTextVisible,
  withFullscreenCanvas,
  withPanel,
  withRouter,
} from "@/components/shared/storybook"
import {
  ClipboardList,
  FilePlus2,
  House,
  Truck,
  Wallet,
} from "lucide-react"

import { UBDrawer } from "./UBDrawer"

const drawerItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <House className="size-4" />,
    to: "/",
  },
  {
    id: "new-requisition",
    label: "New requisition",
    icon: <FilePlus2 className="size-4" />,
    to: "/requisitions/new",
  },
  {
    id: "track-requisitions",
    label: "Track requisitions",
    icon: <ClipboardList className="size-4" />,
    to: "/requisitions",
  },
  {
    id: "budgets",
    label: "Budgets",
    icon: <Wallet className="size-4" />,
    to: "/requisitions/budgets",
  },
  {
    id: "suppliers",
    label: "Suppliers",
    icon: <Truck className="size-4" />,
    to: "/requisitions/suppliers",
  },
]

const meta = {
  title: "Components/UBDrawer",
  component: UBDrawer,
  tags: ["autodocs"],
  args: {
    items: drawerItems,
    persistent: true,
    overlay: false,
    defaultOpen: true,
    defaultMini: false,
  },
  argTypes: {
    ...actionArgTypes,
    persistent: { control: "boolean" },
    overlay: { control: "boolean" },
    defaultOpen: { control: "boolean" },
    defaultMini: { control: "boolean" },
  },
  parameters: componentParameters(
    "Left navigation drawer built on the shadcn Drawer. Supports mini icon-only mode, optional overlay, and persistent mode that stays open across route changes.",
    "fullscreen"
  ),
  decorators: [withRouter(["/requisitions"]), withFullscreenCanvas("min-h-svh bg-muted/30")],
} satisfies Meta<typeof UBDrawer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: drawerItems,
  },
  render: (args) => (
    <UBDrawer {...args}>
      <main className="px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Requisitions</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Persistent drawer with full labels. Route changes do not close the drawer.
        </p>
      </main>
    </UBDrawer>
  ),
  play: async ({ canvasElement }) => {
    await expectTextVisible(canvasElement, "Requisitions")
    await clickButton(canvasElement, /toggle|sidebar|menu/i)
  },
}

export const Mini: Story = {
  args: {
    defaultMini: true,
    items: drawerItems,
  },
  render: (args) => (
    <UBDrawer {...args}>
      <main className="px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Mini drawer</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Icons only. Hover or use the toggle button to expand.
        </p>
      </main>
    </UBDrawer>
  ),
}

export const WithOverlay: Story = {
  args: {
    overlay: true,
    persistent: false,
    defaultOpen: true,
    items: drawerItems,
  },
  render: (args) => (
    <UBDrawer {...args}>
      <main className="px-8 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Overlay drawer</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Modal overlay enabled. Click outside to dismiss when not persistent.
        </p>
      </main>
    </UBDrawer>
  ),
}

export const PanelOnly: Story = {
  args: {
    items: drawerItems,
  },
  decorators: [withRouter(["/"]), withPanel("min-h-[32rem] bg-muted/30 p-6")],
}
