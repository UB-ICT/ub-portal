import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  actionArgTypes,
  componentParameters,
  expectTextVisible,
  withPanel,
} from "@/components/shared/storybook"

import { UBTable } from "./UBTable"

type RequisitionForm = {
  formNumber: string
  submissionDate: string
  amount: number
  status: "pending" | "approved" | "rejected" | "in-review"
  description: string
}

type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
}

type Student = {
  studentId: string
  name: string
  email: string
  gpa: number
  enrollmentStatus: "active" | "inactive" | "suspended"
}

const meta = {
  title: "Components/UBTable",
  component: UBTable,
  tags: ["autodocs"],
  argTypes: {
    ...actionArgTypes,
  },
  parameters: componentParameters(
    "Shared data table component for displaying structured information in rows and columns with support for custom rendering and row interactions."
  ),
  decorators: [withPanel("space-y-4 p-6")],
} satisfies Meta<typeof UBTable>

export default meta

type Story = StoryObj<typeof meta>

const requisitionFormsData: RequisitionForm[] = [
  {
    formNumber: "REQ-2026-001",
    submissionDate: "2026-06-01",
    amount: 15000.0,
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
    amount: 2200.0,
    status: "rejected",
    description: "Marketing materials",
  },
  {
    formNumber: "REQ-2026-005",
    submissionDate: "2026-05-18",
    amount: 72000.0,
    status: "approved",
    description: "Building renovation and maintenance",
  },
]

const getStatusBadgeColor = (status: RequisitionForm["status"]) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "in-review":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const RequisitionFormsTable: Story = {
  render: () => {
    const handleViewForm = (form: RequisitionForm) => {
      alert(`Viewing form: ${form.formNumber}`)
    }

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Requisition Forms</h3>
          <p className="text-sm text-muted-foreground">
            All submitted purchase requisitions
          </p>
        </div>
        <UBTable<RequisitionForm>
          columns={[
            {
              header: "Form Number",
              accessor: "formNumber",
              className: "font-semibold text-primary",
            },
            {
              header: "Submission Date",
              accessor: "submissionDate",
              render: (value) => formatDate(value as string),
            },
            {
              header: "Amount",
              accessor: "amount",
              render: (value) => formatCurrency(value as number),
              className: "text-right",
            },
            {
              header: "Status",
              accessor: "status",
              render: (value) => (
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeColor(value as RequisitionForm["status"])}`}
                >
                  {value}
                </span>
              ),
            },
            {
              header: "Action",
              accessor: "formNumber",
              render: (_value, row) => (
                <button
                  onClick={() => handleViewForm(row)}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  View Details
                </button>
              ),
              className: "text-center",
            },
          ]}
          data={requisitionFormsData}
          rowKey="formNumber"
          striped
        />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    await expectTextVisible(canvasElement, "Requisition Forms")
  },
}

const productsData: Product[] = [
  {
    id: "PROD-001",
    name: "Laptop Computer",
    category: "Electronics",
    price: 1200.0,
    stock: 15,
  },
  {
    id: "PROD-002",
    name: "Office Chair",
    category: "Furniture",
    price: 350.0,
    stock: 42,
  },
  {
    id: "PROD-003",
    name: "Desk Lamp",
    category: "Accessories",
    price: 45.99,
    stock: 0,
  },
  {
    id: "PROD-004",
    name: "Monitor",
    category: "Electronics",
    price: 399.99,
    stock: 28,
  },
  {
    id: "PROD-005",
    name: "Keyboard & Mouse Set",
    category: "Accessories",
    price: 79.99,
    stock: 156,
  },
]

export const ProductsTable: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Product Inventory</h3>
        <p className="text-sm text-muted-foreground">Current stock levels</p>
      </div>
      <UBTable<Product>
        columns={[
          {
            header: "Product ID",
            accessor: "id",
            className: "font-mono text-xs",
          },
          {
            header: "Product Name",
            accessor: "name",
            className: "font-medium",
          },
          {
            header: "Category",
            accessor: "category",
          },
          {
            header: "Price",
            accessor: "price",
            render: (value) => formatCurrency(value as number),
            className: "text-right",
          },
          {
            header: "Stock",
            accessor: "stock",
            render: (value) => {
              const stock = value as number
              const color =
                stock === 0
                  ? "text-destructive font-semibold"
                  : stock < 20
                    ? "text-yellow-600 font-semibold"
                    : "text-green-600 font-semibold"
              return <span className={color}>{stock} units</span>
            },
            className: "text-right",
          },
        ]}
        data={productsData}
        rowKey="id"
        striped
      />
    </div>
  ),
}

const studentsData: Student[] = [
  {
    studentId: "STU-2026-001",
    name: "John Doe",
    email: "john.doe@ub.edu.bz",
    gpa: 3.85,
    enrollmentStatus: "active",
  },
  {
    studentId: "STU-2026-002",
    name: "Maria Garcia",
    email: "maria.garcia@ub.edu.bz",
    gpa: 3.92,
    enrollmentStatus: "active",
  },
  {
    studentId: "STU-2026-003",
    name: "Ahmed Hassan",
    email: "ahmed.hassan@ub.edu.bz",
    gpa: 3.45,
    enrollmentStatus: "active",
  },
  {
    studentId: "STU-2026-004",
    name: "Sarah Wilson",
    email: "sarah.wilson@ub.edu.bz",
    gpa: 2.8,
    enrollmentStatus: "inactive",
  },
  {
    studentId: "STU-2026-005",
    name: "Marcus Johnson",
    email: "marcus.johnson@ub.edu.bz",
    gpa: 0.0,
    enrollmentStatus: "suspended",
  },
]

const getStatusColor = (status: Student["enrollmentStatus"]) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    case "suspended":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }
}

export const EnrollmentTable: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Student Enrollment</h3>
        <p className="text-sm text-muted-foreground">
          Current semester enrollment status
        </p>
      </div>
      <UBTable<Student>
        columns={[
          {
            header: "Student ID",
            accessor: "studentId",
            className: "font-mono text-xs text-primary",
          },
          {
            header: "Name",
            accessor: "name",
            className: "font-medium",
          },
          {
            header: "Email",
            accessor: "email",
            className: "text-sm text-muted-foreground",
          },
          {
            header: "GPA",
            accessor: "gpa",
            render: (value) => (value as number).toFixed(2),
            className: "text-right font-semibold",
          },
          {
            header: "Status",
            accessor: "enrollmentStatus",
            render: (value) => (
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusColor(value as Student["enrollmentStatus"])}`}
              >
                {value}
              </span>
            ),
          },
        ]}
        data={studentsData}
        rowKey="studentId"
        striped
      />
    </div>
  ),
}

type SimpleData = {
  id: number
  name: string
  description: string
  value: string
}

const simpleData: SimpleData[] = [
  { id: 1, name: "Item A", description: "First item", value: "100" },
  { id: 2, name: "Item B", description: "Second item", value: "200" },
  { id: 3, name: "Item C", description: "Third item", value: "150" },
]

export const BasicTable: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Simple Data Table</h3>
        <p className="text-sm text-muted-foreground">
          Basic example with simple data
        </p>
      </div>
      <UBTable<SimpleData>
        columns={[
          {
            header: "ID",
            accessor: "id",
          },
          {
            header: "Name",
            accessor: "name",
          },
          {
            header: "Description",
            accessor: "description",
          },
          {
            header: "Value",
            accessor: "value",
            className: "text-right font-semibold",
          },
        ]}
        data={simpleData}
        rowKey="id"
      />
    </div>
  ),
}

export const EmptyTable: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Empty Table</h3>
        <p className="text-sm text-muted-foreground">
          Table with no data showing empty state
        </p>
      </div>
      <UBTable<Product>
        columns={[
          { header: "ID", accessor: "id" },
          { header: "Name", accessor: "name" },
          { header: "Price", accessor: "price" },
          { header: "Stock", accessor: "stock" },
        ]}
        data={[]}
        rowKey="id"
      />
    </div>
  ),
}
