import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  actionArgTypes,
  componentParameters,
  expectTextVisible,
  withPanel,
} from "@/components/shared/storybook"

import { UBTimeline } from "./UBTimeline"

const meta = {
  title: "Components/UBTimeline",
  component: UBTimeline,
  tags: ["autodocs"],
  args: {
    timelineTitle: "Approval pipeline",
    steps: [
      { title: "Submitted" },
      { title: "Director Approval" },
      { title: "Budget Officer Approval" },
      { title: "Vice President Approval" },
      { title: "Director of Finance" },
    ],
    currentStep: 2,
  },
  argTypes: {
    ...actionArgTypes,
    timelineTitle: { control: "text" },
    currentStep: { control: "number" },
  },
  parameters: componentParameters(
    "Horizontal approval line with step circles showing completed, current, and pending stages inside a bordered card container."
  ),
  decorators: [withPanel("max-w-5xl p-6")],
} satisfies Meta<typeof UBTimeline>

export default meta

type Story = StoryObj<typeof meta>

export const ApprovalPipeline: Story = {
  play: async ({ canvasElement }) => {
    await expectTextVisible(canvasElement, "Approval pipeline")
  },
}
