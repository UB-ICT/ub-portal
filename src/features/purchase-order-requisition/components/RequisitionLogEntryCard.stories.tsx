import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"
import type { RequisitionLogEntry } from "@/lib/api/requisition-logs"

import { RequisitionLogEntryCard } from "./RequisitionLogEntryCard"

const mockEntries: RequisitionLogEntry[] = [
  {
    id: 1,
    requisition_id: 10,
    user_id: "user-1",
    action: "created",
    summary: "Requisition REQ-2026-0001 created.",
    comments: null,
    created_at: "2026-06-17T10:15:00.000Z",
    updated_at: "2026-06-17T10:15:00.000Z",
    user: { id: "user-1", name: "Maria Lopez", email: "maria@ub.edu.bz" },
  },
  {
    id: 2,
    requisition_id: 10,
    user_id: "user-1",
    action: "updated",
    summary:
      "Updated: Priority changed to urgent; Line items updated (4 items); Total changed to 4,500.00.",
    comments: null,
    created_at: "2026-06-17T11:02:00.000Z",
    updated_at: "2026-06-17T11:02:00.000Z",
    user: { id: "user-1", name: "Maria Lopez", email: "maria@ub.edu.bz" },
  },
  {
    id: 3,
    requisition_id: 10,
    user_id: "user-2",
    action: "approved",
    summary: "Approved at Director's Approval stage.",
    comments: "Budget allocation confirmed for Q3.",
    created_at: "2026-06-18T09:30:00.000Z",
    updated_at: "2026-06-18T09:30:00.000Z",
    user: { id: "user-2", name: "James Cain", email: "jcain@ub.edu.bz" },
  },
  {
    id: 4,
    requisition_id: 10,
    user_id: "user-3",
    action: "rejected",
    summary: "Rejected at VP Approval stage.",
    comments: "Please revise supplier quotes and resubmit.",
    created_at: "2026-06-18T14:45:00.000Z",
    updated_at: "2026-06-18T14:45:00.000Z",
    user: { id: "user-3", name: "Patricia Wade", email: "pwade@ub.edu.bz" },
  },
  {
    id: 5,
    requisition_id: 10,
    user_id: "user-1",
    action: "comment",
    summary: "Comment added.",
    comments: "Uploaded revised PDF quotes from both vendors.",
    created_at: "2026-06-18T15:10:00.000Z",
    updated_at: "2026-06-18T15:10:00.000Z",
    user: { id: "user-1", name: "Maria Lopez", email: "maria@ub.edu.bz" },
  },
]

const meta = {
  title: "Purchase Order Requisition/RequisitionLogEntryCard",
  component: RequisitionLogEntryCard,
  tags: ["autodocs"],
  parameters: componentParameters(
    "Single activity log entry with action badge, actor, timestamp, summary, and optional comment."
  ),
  decorators: [withPanel("max-w-3xl space-y-4 p-6")],
} satisfies Meta<typeof RequisitionLogEntryCard>

export default meta

type Story = StoryObj<typeof meta>

export const Created: Story = {
  args: { entry: mockEntries[0] },
}

export const Updated: Story = {
  args: { entry: mockEntries[1] },
}

export const ApprovedWithNote: Story = {
  args: { entry: mockEntries[2] },
}

export const RejectedWithNote: Story = {
  args: { entry: mockEntries[3] },
}

export const CommentOnly: Story = {
  args: { entry: mockEntries[4] },
}
