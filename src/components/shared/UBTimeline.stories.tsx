import type { Meta, StoryObj } from "@storybook/react-vite"

import { UBTimeline } from "./UBTimeline"

const meta = {
  title: "Components/UBTimeline",
  component: UBTimeline,
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
  parameters: {
    docs: {
      description: {
        component:
          "Horizontal approval line with step circles showing completed, current, and pending stages inside a bordered card container.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-5xl p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UBTimeline>

export default meta

type Story = StoryObj<typeof meta>

export const ApprovalPipeline: Story = {}

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
