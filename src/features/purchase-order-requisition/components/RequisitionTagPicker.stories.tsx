import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { componentParameters, withPanel } from "@/components/shared/storybook"
import type { RequisitionTag } from "@/lib/api/tags"
import { RequisitionTagPicker } from "./RequisitionTagPicker"

const sampleTags: RequisitionTag[] = [
  { id: 1, name: "Lab equipment", cost_center_id: 1 },
  { id: 2, name: "Conference travel", cost_center_id: 1 },
]

const meta = {
  title: "Purchase Order Requisition/RequisitionTagPicker",
  component: RequisitionTagPicker,
  tags: ["autodocs"],
  parameters: componentParameters(
    "Cost-center-scoped tag chips for requisitions. Create-on-type requires API."
  ),
  decorators: [withPanel("p-6 max-w-xl")],
} satisfies Meta<typeof RequisitionTagPicker>

export default meta
type Story = StoryObj<typeof meta>

export const ReadOnly: Story = {
  args: {
    costCenterId: 1,
    selectedTags: sampleTags,
    onChange: () => undefined,
    disabled: true,
  },
}

export const InteractiveLocal: Story = {
  render: function InteractiveTagPicker() {
    const [selectedTags, setSelectedTags] = useState<RequisitionTag[]>([
      sampleTags[0],
    ])

    return (
      <RequisitionTagPicker
        costCenterId={null}
        selectedTags={selectedTags}
        onChange={setSelectedTags}
      />
    )
  },
}
