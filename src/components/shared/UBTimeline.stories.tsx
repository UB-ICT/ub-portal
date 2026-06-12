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
      { title: "Finance Review" },
      { title: "Final Approval" },
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

export const RegistrationPipeline: Story = {
  args: {
    timelineTitle: "Registration pipeline",
    steps: [
      { title: "Submitted" },
      { title: "Documents Check" },
      { title: "Director Approval" },
      { title: "Registered" },
    ],
    currentStep: 3,
  },
}

export const CompletedPipeline: Story = {
  args: {
    timelineTitle: "Approval pipeline",
    steps: [
      { title: "Submitted" },
      { title: "Director Approval" },
      { title: "Finance Review" },
      { title: "Final Approval" },
    ],
    currentStep: 4,
  },
}

export const EarlyStagePipeline: Story = {
  args: {
    timelineTitle: "Registration pipeline",
    steps: [
      { title: "Submitted" },
      { title: "Director Approval" },
      { title: "Finance Review" },
      { title: "Final Approval" },
    ],
    currentStep: 1,
  },
}
