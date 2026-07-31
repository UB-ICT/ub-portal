import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { componentParameters } from "@/components/shared/storybook"
import { UBArrowStage } from "./UBArrowStage"

const meta = {
  title: "Components/UBArrowStage",
  component: UBArrowStage,
  tags: ["autodocs"],
  args: {
    label: "Budget Officer",
    sequence: 1,
    userCount: 2,
    isFirst: true,
    isLast: false,
    selected: false,
  },
  parameters: componentParameters(
    "Chevron-shaped stage node for pipeline editors."
  ),
} satisfies Meta<typeof UBArrowStage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  args: {
    selected: true,
  },
}

export const MiddleStage: Story = {
  args: {
    label: "Senior Accountant",
    sequence: 2,
    isFirst: false,
    isLast: false,
  },
}

export const LastStage: Story = {
  args: {
    label: "Finance Director",
    sequence: 3,
    isFirst: false,
    isLast: true,
    userCount: 1,
  },
}

export const Interactive: Story = {
  render: function InteractiveArrowStage() {
    const [selected, setSelected] = useState(false)

    return (
      <UBArrowStage
        label="Cost Center"
        sequence={1}
        userCount={3}
        isFirst
        selected={selected}
        onClick={() => setSelected((value) => !value)}
      />
    )
  },
}
