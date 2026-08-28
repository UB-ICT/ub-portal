import type { Meta, StoryObj } from "@storybook/react-vite"

import { componentParameters, withPanel } from "@/components/shared/storybook"
import type { RequisitionForm } from "@/lib/api/dashboard"

import { RecentFormsView } from "./RequisitionRecentForms"

const forms: RequisitionForm[] = [
  {
    id: 1,
    number: "000000012",
    supplier_name: "Belize Office Box",
    date_prepared: "2026-07-28",
    total: 2340,
    status_name: "In Review",
    current_stage_name: "Director review",
    processing_time_hours: null,
    processing_time_display: null,
    approval_time_hours: null,
    approval_time_display: null,
  },
  {
    id: 2,
    number: "000000011",
    supplier_name: "Caribbean Tech Supplies",
    date_prepared: "2026-07-21",
    total: 985.5,
    status_name: "Approved",
    current_stage_name: "Purchase Officer",
    processing_time_hours: 26,
    processing_time_display: "1d 2h",
    approval_time_hours: 20,
    approval_time_display: "20h",
  },
  {
    id: 3,
    number: "000000010",
    supplier_name: "Belize Print & Copy",
    date_prepared: "2026-07-15",
    total: 410,
    status_name: "Rejected",
    current_stage_name: "Budget review",
    processing_time_hours: 8,
    processing_time_display: "8h",
    approval_time_hours: null,
    approval_time_display: null,
  },
  {
    id: 4,
    number: "000000009",
    supplier_name: "Northern Hardware Co.",
    date_prepared: "2026-07-10",
    total: 5600,
    status_name: "Approved",
    current_stage_name: "Finance review",
    processing_time_hours: 72,
    processing_time_display: "3d",
    approval_time_hours: 65,
    approval_time_display: "2d 17h",
  },
  {
    id: 5,
    number: "000000008",
    supplier_name: "Reef Office Solutions",
    date_prepared: "2026-07-02",
    total: 1275,
    status_name: "Approved",
    current_stage_name: "Vice President",
    processing_time_hours: 40,
    processing_time_display: "1d 16h",
    approval_time_hours: 30,
    approval_time_display: "1d 6h",
  },
  {
    id: 6,
    number: "000000007",
    supplier_name: "Cayo Farm Supplies",
    date_prepared: "2026-06-25",
    total: 320,
    status_name: "Approved",
    current_stage_name: "Purchase Officer",
    processing_time_hours: 12,
    processing_time_display: "12h",
    approval_time_hours: 10,
    approval_time_display: "10h",
  },
]

const stageTimingForms: RequisitionForm[] = [
  {
    id: 1,
    number: "000000012",
    supplier_name: "Belize Office Box",
    date_prepared: "2026-07-28",
    total: 2340,
    status_name: "In Review",
    current_stage_name: "Director review",
    time_at_stage_hours: 3,
    time_at_stage_display: "3h",
  },
  {
    id: 2,
    number: "000000011",
    supplier_name: "Caribbean Tech Supplies",
    date_prepared: "2026-07-21",
    total: 985.5,
    status_name: "In Review",
    current_stage_name: "Budget review",
    time_at_stage_hours: 26,
    time_at_stage_display: "1d 2h",
  },
]

const meta = {
  title: "Purchase Order Requisition/RecentFormsView",
  component: RecentFormsView,
  tags: ["autodocs"],
  args: {
    forms,
    isLoading: false,
    error: null,
    onViewAllForms: () => undefined,
  },
  parameters: componentParameters(
    "Paginated table of a user's recent requisition forms, with either processing/approval totals (requester view) or a single time-at-stage figure (workflow role view)."
  ),
  decorators: [withPanel("max-w-5xl space-y-4 p-6")],
} satisfies Meta<typeof RecentFormsView>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SingleRecord: Story = {
  args: {
    forms: [
      {
        id: 1,
        number: "000000001",
        supplier_name: "501 Enterprise",
        date_prepared: "2026-08-17",
        total: 275,
        status_name: "In Review",
        current_stage_name: "Purchase Officer Approval",
        processing_time_hours: 0.52,
        processing_time_display: "31 minutes",
        approval_time_hours: null,
        approval_time_display: null,
      },
    ],
  },
}

export const StageTimingView: Story = {
  args: {
    forms: stageTimingForms,
  },
}

export const Paginated: Story = {
  args: {
    forms: [
      ...forms,
      ...forms.map((form, index) => ({
        ...form,
        id: form.id + forms.length,
        number: String(Number(form.number) - forms.length).padStart(9, "0"),
      })),
    ],
  },
}

export const Loading: Story = {
  args: {
    forms: [],
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    forms: [],
    isLoading: false,
  },
}

export const Error: Story = {
  args: {
    forms: [],
    error: "Unable to reach the reporting service.",
  },
}
