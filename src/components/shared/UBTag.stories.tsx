import type { Meta, StoryObj } from "@storybook/react-vite"
import { BookOpen, CheckCircle2, Clock3, GraduationCap, TriangleAlert } from "lucide-react"
import { useState } from "react"
import {
  actionArgTypes,
  componentParameters,
  expectTextVisible,
  withPanel,
} from "@/components/shared/storybook"

import { UBTag } from "./UBTag"

const meta = {
  title: "Components/UBTag",
  component: UBTag,
  tags: ["autodocs"],
  args: {
    text: "Pending",
    icon: <Clock3 />,
    variant: "neutral",
    size: "sm",
  },
  argTypes: {
    ...actionArgTypes,
    text: { control: "text" },
    variant: { control: "select", options: ["neutral", "primary", "secondary", "destructive"] },
    size: { control: "select", options: ["sm", "md"] },
    count: { control: "number" },
    interactive: { control: "boolean" },
    selected: { control: "boolean" },
  },
  parameters: componentParameters(
    "Small oval tag with an icon and label for statuses and categories, with light background and complementary text/icon colors."
  ),
  decorators: [withPanel("p-6")],
} satisfies Meta<typeof UBTag>

export default meta

type Story = StoryObj<typeof meta>

export const Pending: Story = {
  args: {
    text: "Pending",
    icon: <Clock3 />,
    variant: "neutral",
  },
  play: async ({ canvasElement }) => {
    await expectTextVisible(canvasElement, "Pending")
  },
}

export const Education: Story = {
  args: {
    text: "Education",
    icon: <GraduationCap />,
    variant: "primary",
  },
}

export const Approved: Story = {
  args: {
    text: "Approved",
    icon: <CheckCircle2 />,
    variant: "secondary",
  },
}

export const Warning: Story = {
  args: {
    text: "Needs Review",
    icon: <TriangleAlert />,
    variant: "destructive",
  },
}

export const Category: Story = {
  args: {
    text: "Course",
    icon: <BookOpen />,
    variant: "primary",
    size: "md",
  },
}

export const TagGroup: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <UBTag text="Pending" icon={<Clock3 />} variant="neutral" />
      <UBTag text="Education" icon={<GraduationCap />} variant="primary" />
      <UBTag text="Approved" icon={<CheckCircle2 />} variant="secondary" />
      <UBTag text="Needs Review" icon={<TriangleAlert />} variant="destructive" />
      <UBTag text="Course" icon={<BookOpen />} variant="primary" size="md" />
    </div>
  ),
}

export const ClickableTagGroup: Story = {
  render: () => {
    const [activeTag, setActiveTag] = useState("education")

    return (
      <div className="flex flex-wrap items-center gap-2">
        <UBTag
          text="Education"
          icon={<GraduationCap />}
          variant="primary"
          interactive
          selected={activeTag === "education"}
          onClick={() => setActiveTag("education")}
        />
        <UBTag
          text="Finance"
          icon={<BookOpen />}
          variant="secondary"
          interactive
          selected={activeTag === "finance"}
          onClick={() => setActiveTag("finance")}
        />
        <UBTag
          text="Pending"
          icon={<Clock3 />}
          variant="neutral"
          interactive
          selected={activeTag === "pending"}
          onClick={() => setActiveTag("pending")}
        />
      </div>
    )
  },
}

export const CategoryCounts: Story = {
  render: () => {
    const [activeCategory, setActiveCategory] = useState("all")

    const categoryCounts = {
      all: 42,
      education: 14,
      finance: 9,
      procurement: 12,
      operations: 7,
    }

    return (
      <div className="flex flex-wrap items-center gap-2">
        <UBTag
          text="All"
          count={categoryCounts.all}
          variant="neutral"
          interactive
          selected={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        />
        <UBTag
          text="Education"
          count={categoryCounts.education}
          variant="primary"
          interactive
          selected={activeCategory === "education"}
          onClick={() => setActiveCategory("education")}
        />
        <UBTag
          text="Finance"
          count={categoryCounts.finance}
          variant="secondary"
          interactive
          selected={activeCategory === "finance"}
          onClick={() => setActiveCategory("finance")}
        />
        <UBTag
          text="Procurement"
          count={categoryCounts.procurement}
          variant="neutral"
          interactive
          selected={activeCategory === "procurement"}
          onClick={() => setActiveCategory("procurement")}
        />
        <UBTag
          text="Operations"
          count={categoryCounts.operations}
          variant="destructive"
          interactive
          selected={activeCategory === "operations"}
          onClick={() => setActiveCategory("operations")}
        />
      </div>
    )
  },
}
