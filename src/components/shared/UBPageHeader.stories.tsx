import type { Meta, StoryObj } from "@storybook/react-vite"
import { Plus } from "lucide-react"

import { componentParameters, withPanel } from "@/components/shared/storybook"
import { UBButton } from "./UBButton"
import { UBPageHeader } from "./UBPageHeader"

const meta = {
  title: "Shared/UBPageHeader",
  component: UBPageHeader,
  tags: ["autodocs"],
  args: {
    title: "Suppliers",
    description: "Manage vendor records and finance approvals.",
  },
  parameters: componentParameters(
    "Page-level header used across the Purchase Order Requisition admin pages: a title/description pair, an optional actions slot ('section' variant), or a larger banner style for dashboard landing pages ('dashboard' variant)."
  ),
  decorators: [withPanel("max-w-3xl p-6")],
} satisfies Meta<typeof UBPageHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Suppliers: Story = {
  args: {
    title: "Suppliers",
    description: "Manage vendor records and finance approvals.",
    actions: (
      <UBButton size="sm">
        <Plus className="size-4" data-icon="inline-start" />
        Add supplier
      </UBButton>
    ),
  },
}

export const Accounts: Story = {
  args: {
    title: "Accounts",
    description:
      "Manage chart of account numbers and descriptions, including nested child accounts under a parent.",
    actions: (
      <UBButton size="sm">
        <Plus className="size-4" data-icon="inline-start" />
        Add account
      </UBButton>
    ),
  },
}

export const CostCenters: Story = {
  args: {
    title: "Cost centers",
    description:
      "Manage departments used for requisitions, budgets, and user assignments.",
    actions: (
      <UBButton size="sm">
        <Plus className="size-4" data-icon="inline-start" />
        Add cost center
      </UBButton>
    ),
  },
}

export const Budget: Story = {
  args: {
    title: "Budget",
    description:
      "Prepare, compare, submit, and approve cost center budgets by year.",
    actions: (
      <UBButton size="sm">
        <Plus className="size-4" data-icon="inline-start" />
        New budget
      </UBButton>
    ),
  },
}

export const Pipelines: Story = {
  args: {
    title: "Pipelines",
    description: "Configure approval pipelines, stage order, and stage assignees.",
    actions: (
      <UBButton size="sm">
        <Plus className="size-4" data-icon="inline-start" />
        Add pipeline
      </UBButton>
    ),
  },
}

export const NoActions: Story = {
  args: {
    title: "Cost centers",
    description:
      "Manage departments used for requisitions, budgets, and user assignments.",
  },
}

export const Dashboard: Story = {
  args: {
    variant: "dashboard",
    title: "Purchase Order Requisitions",
    description: (
      <>
        Welcome back. Tracking metrics active for:{" "}
        <span className="font-semibold text-primary">Super Admin</span>
      </>
    ),
  },
}

export const RequesterDashboard: Story = {
  args: {
    variant: "dashboard",
    title: "My Requisitions",
    description: "Welcome back. Here's where your requisitions stand.",
  },
}
