import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import {
  actionArgTypes,
  componentParameters,
  expectTextVisible,
  withPanel,
} from "@/components/shared/storybook"

import { UBDataTable } from "./data-table"

type RequisitionForm = {
  formNumber: string
  submissionDate: string
  amount: number
  status: "pending" | "approved" | "rejected" | "in-review"
  description: string
}

const meta = {
  title: "Components/UBDataTable",
  component: UBDataTable,
  tags: ["autodocs"],
  argTypes: {
    ...actionArgTypes,
    sortable: { control: "boolean" },
    resizable: { control: "boolean" },
    striped: { control: "boolean" },
  },
  parameters: componentParameters(
    "Canonical data table with sortable headers and resizable columns. Use this component (or UBTable, which wraps it) instead of raw HTML tables."
  ),
  decorators: [withPanel("space-y-4 p-6")],
} satisfies Meta<typeof UBDataTable>

export default meta

type Story = StoryObj<typeof meta>

const requisitionFormsData: RequisitionForm[] = [
  {
    formNumber: "REQ-2026-001",
    submissionDate: "2026-06-01",
    amount: 15000,
    status: "approved",
    description: "Office supplies and equipment",
  },
  {
    formNumber: "REQ-2026-002",
    submissionDate: "2026-05-28",
    amount: 45000.5,
    status: "in-review",
    description: "Technology infrastructure upgrade",
  },
  {
    formNumber: "REQ-2026-003",
    submissionDate: "2026-05-25",
    amount: 8500.75,
    status: "pending",
    description: "Furniture for new office wing",
  },
  {
    formNumber: "REQ-2026-004",
    submissionDate: "2026-05-20",
    amount: 2200,
    status: "rejected",
    description: "Marketing materials",
  },
  {
    formNumber: "REQ-2026-005",
    submissionDate: "2026-05-18",
    amount: 72000,
    status: "approved",
    description: "Building renovation and maintenance",
  },
]

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

export const SortableResizable: Story = {
  render: () => (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold">Sortable & resizable columns</h3>
        <p className="text-sm text-muted-foreground">
          Click a header to sort. Drag the column edge to resize.
        </p>
      </div>
      <UBDataTable<RequisitionForm>
        rowKey="formNumber"
        data={requisitionFormsData}
        sortable
        resizable
        columns={[
          {
            id: "formNumber",
            header: "Form number",
            accessor: "formNumber",
            initialWidth: 160,
            className: "font-semibold text-primary",
          },
          {
            id: "submissionDate",
            header: "Submitted",
            accessor: "submissionDate",
            initialWidth: 140,
            render: (value) => formatDate(String(value)),
          },
          {
            id: "amount",
            header: "Amount",
            accessor: "amount",
            initialWidth: 120,
            className: "text-right tabular-nums",
            render: (value) => formatCurrency(Number(value)),
          },
          {
            id: "status",
            header: "Status",
            accessor: "status",
            initialWidth: 120,
            render: (value) => (
              <span className="capitalize">{String(value)}</span>
            ),
          },
          {
            id: "description",
            header: "Description",
            accessor: "description",
            initialWidth: 280,
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectTextVisible(canvasElement, "Sortable & resizable columns")
  },
}

type LineItem = {
  id: string
  account: string
  notes: string
  quantity: number
  unitCost: number
  total: number
}

const lineItems: LineItem[] = [
  {
    id: "1",
    account: "70314 Computer Supplies",
    notes: "Dell preferred",
    quantity: 5,
    unitCost: 350,
    total: 1750,
  },
  {
    id: "2",
    account: "70315 Office Equipment",
    notes: "",
    quantity: 10,
    unitCost: 85,
    total: 850,
  },
  {
    id: "3",
    account: "70523 Hardware Maintenance",
    notes: "Dual display",
    quantity: 6,
    unitCost: 130,
    total: 780,
  },
]

export const EditableGridPattern: Story = {
  render: () => {
    const [rows, setRows] = useState(lineItems)

    return (
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold">Editable grid pattern</h3>
          <p className="text-sm text-muted-foreground">
            Sorting reorders rows via <code>onSortedDataChange</code>.
          </p>
        </div>
        <UBDataTable<LineItem>
          rowKey="id"
          data={rows}
          responsive={false}
          density="compact"
          tableClassName="overflow-hidden rounded-xl border border-border"
          onSortedDataChange={setRows}
          striped={false}
          getRowClassName={(_row, index) =>
            index % 2 === 1 ? "bg-muted/50" : undefined
          }
          columns={[
            {
              id: "account",
              header: "Budget line item",
              accessor: "account",
              initialWidth: 260,
              disableTruncate: true,
            },
            {
              id: "notes",
              header: "Notes",
              accessor: "notes",
              initialWidth: 140,
            },
            {
              id: "quantity",
              header: "Qty",
              accessor: "quantity",
              initialWidth: 80,
              className: "tabular-nums",
            },
            {
              id: "unitCost",
              header: "Unit cost",
              accessor: "unitCost",
              initialWidth: 110,
              className: "tabular-nums",
              render: (value) => formatCurrency(Number(value)),
            },
            {
              id: "total",
              header: "Total",
              accessor: "total",
              initialWidth: 110,
              className: "tabular-nums font-medium",
              render: (value) => formatCurrency(Number(value)),
            },
          ]}
        />
      </div>
    )
  },
}

export const EmptyState: Story = {
  render: () => (
    <UBDataTable<{ id: string; name: string }>
      rowKey="id"
      data={[]}
      emptyMessage="No rows to display"
      columns={[
        { id: "id", header: "ID", accessor: "id" },
        { id: "name", header: "Name", accessor: "name" },
      ]}
    />
  ),
}
