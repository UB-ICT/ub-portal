import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowRight, Plus } from "lucide-react"
import { useState } from "react"
import {
  actionArgTypes,
  componentParameters,
  fillInput,
  withPanel,
} from "@/components/shared/storybook"

import { UBButton } from "./UBButton"
import { UBInput, UBNativeSelect, UBTextarea } from "./UBInput"

const inputMeta = {
  title: "Components/UBInput",
  component: UBInput,
  tags: ["autodocs"],
  argTypes: {
    ...actionArgTypes,
    label: { control: "text" },
    type: {
      control: "select",
      options: ["text", "email", "date", "number", "password", "tel"],
    },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    error: { control: "text" },
  },
  parameters: componentParameters(
    "Shared form input components for UB Portal forms, featuring uppercase labels, light borders, and purple focus states."
  ),
  decorators: [withPanel("max-w-5xl space-y-6 p-6")],
} satisfies Meta<typeof UBInput>

export default inputMeta

type InputStory = StoryObj<typeof inputMeta>

export const TextInput: InputStory = {
  args: {
    label: "Full name",
    type: "text",
    placeholder: "John Doe",
  },
  play: async ({ canvasElement }) => {
    await fillInput(canvasElement, "Full name", "Maria Castillo")
  },
}

export const EmailInput: InputStory = {
  args: {
    label: "Email address",
    type: "email",
    placeholder: "john@example.com",
  },
}

export const DateInput: InputStory = {
  args: {
    label: "Date of birth",
    type: "date",
  },
}

export const NumberInput: InputStory = {
  args: {
    label: "Student ID",
    type: "number",
    placeholder: "12345678",
  },
}

export const PasswordInput: InputStory = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
  },
}

export const PhoneInput: InputStory = {
  args: {
    label: "Phone number",
    type: "tel",
    placeholder: "+1 (501) 123-4567",
  },
}

export const WithError: InputStory = {
  args: {
    label: "Email address",
    type: "email",
    placeholder: "john@example.com",
    error: "Please enter a valid email address",
  },
}

export const Disabled: InputStory = {
  args: {
    label: "Student ID",
    type: "text",
    placeholder: "Cannot be edited",
    disabled: true,
    value: "SID12345",
  },
}

const selectMeta = {
  title: "Components/UBNativeSelect",
  component: UBNativeSelect,
  tags: ["autodocs"],
  argTypes: {
    ...actionArgTypes,
    label: { control: "text" },
    error: { control: "text" },
  },
  parameters: componentParameters(
    "Shared select/dropdown component for UB Portal forms with uppercase labels and purple focus states."
  ),
  decorators: [withPanel("max-w-md space-y-6 p-6")],
} satisfies Meta<typeof UBNativeSelect>

type SelectStory = StoryObj<typeof selectMeta>

export const SelectInput: SelectStory = {
  args: {
    label: "Department",
    options: [
      { value: "", label: "Select a department" },
      { value: "engineering", label: "Engineering" },
      { value: "business", label: "Business" },
      { value: "science", label: "Science" },
      { value: "arts", label: "Arts" },
    ],
  },
}

export const SelectWithError: SelectStory = {
  args: {
    label: "Program",
    options: [
      { value: "", label: "Select a program" },
      { value: "bba", label: "Bachelor of Business Administration" },
      { value: "bs", label: "Bachelor of Science" },
      { value: "ba", label: "Bachelor of Arts" },
    ],
    error: "Please select a program",
  },
}

const textareaMeta = {
  title: "Components/UBTextarea",
  component: UBTextarea,
  tags: ["autodocs"],
  argTypes: {
    ...actionArgTypes,
    label: { control: "text" },
    placeholder: { control: "text" },
    rows: { control: "number" },
    error: { control: "text" },
  },
  parameters: componentParameters(
    "Shared textarea component for UB Portal forms with uppercase labels and purple focus states."
  ),
  decorators: [withPanel("max-w-md space-y-6 p-6")],
} satisfies Meta<typeof UBTextarea>

type TextareaStory = StoryObj<typeof textareaMeta>

export const TextareaInput: TextareaStory = {
  args: {
    label: "Additional comments",
    placeholder: "Enter any additional information here...",
    rows: 5,
  },
}

export const TextareaWithError: TextareaStory = {
  args: {
    label: "Essay response",
    placeholder: "Write your response here...",
    rows: 5,
    error: "Response is required and must be at least 100 characters",
  },
}

export const FormExample: InputStory = {
  render: () => {
    const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      dateOfBirth: "",
      department: "",
      comments: "",
    })

    return (
      <div className="max-w-md space-y-4">
        <UBInput
          label="Full name"
          type="text"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />
        <UBInput
          label="Email address"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <UBInput
          label="Date of birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) =>
            setFormData({ ...formData, dateOfBirth: e.target.value })
          }
        />
        <UBNativeSelect
          label="Department"
          options={[
            { value: "", label: "Select a department" },
            { value: "engineering", label: "Engineering" },
            { value: "business", label: "Business" },
            { value: "science", label: "Science" },
          ]}
          value={formData.department}
          onChange={(e) =>
            setFormData({ ...formData, department: e.target.value })
          }
        />
        <UBTextarea
          label="Additional comments"
          placeholder="Enter any additional information here..."
          rows={4}
          value={formData.comments}
          onChange={(e) =>
            setFormData({ ...formData, comments: e.target.value })
          }
        />
      </div>
    )
  },
  args: {
    label: "Form example",
  },
}

type LineItem = {
  description: string
  cost: string
  quantity: string
  notes: string
}

export const RequisitionFormWithLineItems: InputStory = {
  render: () => {
    const [formData, setFormData] = useState({
      requestTitle: "",
      department: "",
      requestDate: "",
      neededBy: "",
    })

    const [lineItems, setLineItems] = useState<LineItem[]>([
      { description: "", cost: "", quantity: "", notes: "" },
    ])

    const updateLineItem = (
      index: number,
      field: keyof LineItem,
      value: string
    ) => {
      setLineItems((currentItems) =>
        currentItems.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item
        )
      )
    }

    const addLineItem = () => {
      setLineItems((currentItems) => [
        ...currentItems,
        { description: "", cost: "", quantity: "", notes: "" },
      ])
    }

    const rowTotal = (item: LineItem) => {
      const cost = Number(item.cost) || 0
      const quantity = Number(item.quantity) || 0
      return cost * quantity
    }

    const orderTotal = lineItems.reduce((sum, item) => sum + rowTotal(item), 0)

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <UBInput
            label="Request title"
            type="text"
            placeholder="Office supplies purchase"
            value={formData.requestTitle}
            onChange={(e) =>
              setFormData({ ...formData, requestTitle: e.target.value })
            }
          />
          <UBNativeSelect
            label="Department"
            options={[
              { value: "", label: "Select department" },
              { value: "registrar", label: "Registrar" },
              { value: "finance", label: "Finance" },
              { value: "student-affairs", label: "Student Affairs" },
            ]}
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
          />
          <UBInput
            label="Request date"
            type="date"
            value={formData.requestDate}
            onChange={(e) =>
              setFormData({ ...formData, requestDate: e.target.value })
            }
          />
          <UBInput
            label="Needed by"
            type="date"
            value={formData.neededBy}
            onChange={(e) =>
              setFormData({ ...formData, neededBy: e.target.value })
            }
          />
        </div>

        <div className="rounded-2xl border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[53.75rem] text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-3 py-2 text-left font-medium text-foreground">Item #</th>
                  <th className="px-3 py-2 text-left font-medium text-foreground">Description</th>
                  <th className="px-3 py-2 text-left font-medium text-foreground">Cost</th>
                  <th className="px-3 py-2 text-left font-medium text-foreground">Quantity</th>
                  <th className="px-3 py-2 text-left font-medium text-foreground">Total</th>
                  <th className="px-3 py-2 text-left font-medium text-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={`item-${index}`} className="border-b last:border-b-0">
                    <td className="px-3 py-2 text-muted-foreground">{index + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, "description", e.target.value)
                        }
                        placeholder="Item description"
                        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={item.cost}
                        onChange={(e) => updateLineItem(index, "cost", e.target.value)}
                        placeholder="0.00"
                        inputMode="decimal"
                        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(index, "quantity", e.target.value)
                        }
                        placeholder="0"
                        inputMode="numeric"
                        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-foreground">
                      ${rowTotal(item).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={item.notes}
                        onChange={(e) => updateLineItem(index, "notes", e.target.value)}
                        placeholder="Optional notes"
                        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          <div className="flex items-center justify-between gap-3 border-t px-3 py-3">
            <UBButton variant="outline" onClick={addLineItem}>
              <Plus className="size-4" />
              Add line item
            </UBButton>

            <div className="text-sm">
              <span className="text-muted-foreground">Order total: </span>
              <span className="font-semibold text-foreground">${orderTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Submitting as Maria Castillo | Procurement Department
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <UBButton variant="outline">Save draft</UBButton>
          <UBButton>
            Submit for approval
            <ArrowRight className="size-4" />
          </UBButton>
        </div>
      </div>
    )
  },
  args: {
    label: "Requisition form with line items",
  },
}
