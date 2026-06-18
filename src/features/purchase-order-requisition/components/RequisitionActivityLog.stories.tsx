import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"
import type { RequisitionLogEntry } from "@/lib/api/requisition-logs"
import { useRequisitionLogsStore } from "@/store/requisition-logs-store"

import { RequisitionActivityLog } from "./RequisitionActivityLog"

const mockLogs: RequisitionLogEntry[] = [
  {
    id: 1,
    requisition_id: 42,
    user_id: "user-1",
    action: "submitted",
    summary: "Updated: Supplier quotes updated (2 suppliers).",
    comments: "Ready for director review.",
    created_at: "2026-06-17T16:20:00.000Z",
    updated_at: "2026-06-17T16:20:00.000Z",
    user: { id: "user-1", name: "Maria Lopez", email: "maria@ub.edu.bz" },
  },
  {
    id: 2,
    requisition_id: 42,
    user_id: "user-2",
    action: "approved",
    summary: "Approved at Director's Approval stage.",
    comments: null,
    created_at: "2026-06-18T08:00:00.000Z",
    updated_at: "2026-06-18T08:00:00.000Z",
    user: { id: "user-2", name: "James Cain", email: "jcain@ub.edu.bz" },
  },
]

const meta = {
  title: "Purchase Order Requisition/RequisitionActivityLog",
  component: RequisitionActivityLog,
  tags: ["autodocs"],
  parameters: componentParameters(
    "Activity timeline for a requisition with optional comment composer."
  ),
  decorators: [withPanel("max-w-3xl space-y-4 p-6")],
  beforeEach: () => {
    window.localStorage.setItem("ub-portal.access-token", "storybook-token")
  },
} satisfies Meta<typeof RequisitionActivityLog>

export default meta

type Story = StoryObj<typeof meta>

export const WithoutRequisition: Story = {
  args: {
    requisitionId: undefined,
  },
}

export const WithActivity: Story = {
  render: () => {
    useRequisitionLogsStore.setState({
      logs: mockLogs,
      isLoading: false,
      isSubmittingComment: false,
      error: null,
    })

    return <RequisitionActivityLog requisitionId={42} />
  },
}

export const Loading: Story = {
  render: () => {
    useRequisitionLogsStore.setState({
      logs: [],
      isLoading: true,
      isSubmittingComment: false,
      error: null,
    })

    return <RequisitionActivityLog requisitionId={42} />
  },
}

export const ReadOnlyTimeline: Story = {
  render: () => {
    useRequisitionLogsStore.setState({
      logs: mockLogs,
      isLoading: false,
      isSubmittingComment: false,
      error: null,
    })

    return <RequisitionActivityLog requisitionId={42} allowComments={false} />
  },
}
