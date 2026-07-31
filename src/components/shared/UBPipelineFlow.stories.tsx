import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { componentParameters } from "@/components/shared/storybook"
import { UBPipelineFlow } from "./UBPipelineFlow"

const sampleStages = [
  { id: 1, label: "Cost Center", sequence: 1, userCount: 2 },
  { id: 2, label: "Director / Dean", sequence: 2, userCount: 1 },
  { id: 3, label: "Budget Officer", sequence: 3, userCount: 3 },
  { id: 4, label: "Finance Director", sequence: 4, userCount: 1 },
]

const meta = {
  title: "Components/UBPipelineFlow",
  component: UBPipelineFlow,
  tags: ["autodocs"],
  args: {
    stages: sampleStages,
    selectedStageId: 2,
  },
  parameters: componentParameters(
    "Horizontal arrow-stage flow for configuring requisition pipelines."
  ),
} satisfies Meta<typeof UBPipelineFlow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: {
    stages: [],
  },
}

export const Interactive: Story = {
  render: function InteractivePipelineFlow() {
    const [selectedStageId, setSelectedStageId] = useState<number | null>(1)

    return (
      <UBPipelineFlow
        stages={sampleStages}
        selectedStageId={selectedStageId}
        onStageSelect={(id) => setSelectedStageId(Number(id))}
      />
    )
  },
}
