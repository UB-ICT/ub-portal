import type { Meta, StoryObj } from "@storybook/react-vite"
import { FileText } from "lucide-react"
import {
  actionArgTypes,
  componentParameters,
  expectTextVisible,
  withMaxWidth,
  withPanel,
} from "@/components/shared/storybook"

import { UBCard } from "./UBCard"

const meta = {
  title: "Components/UBCard",
  component: UBCard,
  tags: ["autodocs"],
  args: {
    subtitle: "Pending Approval",
    title: "2",
    description:
      "Needs action",
  },
  argTypes: {
    ...actionArgTypes,
    subtitle: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
  },
  parameters: componentParameters(
    "Shared card block for UB Portal content sections, featuring a muted uppercase subtitle, a prominent title, and supporting text."
  ),
  decorators: [withPanel("p-6"), withMaxWidth("max-w-md")],
} satisfies Meta<typeof UBCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expectTextVisible(canvasElement, "Pending Approval")
  },
}

export const Compact: Story = {
  args: {
    subtitle: "Status",
    title: "Active",
    description: "Your account is verified and ready for portal access.",
  },
}

export const LongContent: Story = {
  args: {
    subtitle: "Current term",
    title: "Fall 2026 Registration",
    description:
      "Registration opens on Monday at 8:00 AM and closes on Friday at 5:00 PM. Please review your holds before proceeding.",
  },
}

export const WithImage: Story = {
  args: {
    title: "Campus Facilities Upgrade",
    description:
      "Renovation work is in progress for the central library and student common areas.",
    imageSrc:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "University campus building",
  },
}

export const WithImageAndButton: Story = {
  args: {
    title: "Procurement Request",
    description:
      "A new request has been submitted and is awaiting review from the finance team.",
    imageSrc:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Desk with procurement documents",
    actionLabel: "See more",
    onAction: () => undefined,
  },
}

export const WithIcon: Story = {
  args: {
    title: "Forms Pending",
    description:
      "You have 3 requisition forms waiting for approval in your queue.",
    icon: <FileText className="size-6" />,
  },
}