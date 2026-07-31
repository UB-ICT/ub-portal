import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  componentParameters,
  withPanel,
} from "@/components/shared/storybook"

import { PdfViewer } from "./PdfViewer"

const meta = {
  title: "Purchase Order Requisition/PdfViewer",
  component: PdfViewer,
  tags: ["autodocs"],
  parameters: componentParameters(
    "File button that opens a dialog with PDF preview, plus download and remove actions for supplier quote documents."
  ),
  decorators: [withPanel("max-w-3xl space-y-6 p-6")],
} satisfies Meta<typeof PdfViewer>

export default meta

type Story = StoryObj<typeof meta>

export const WithLocalFile: Story = {
  args: {
    fileName: "sample-supplier-quote.pdf",
    file: new File(["%PDF-1.4 sample"], "sample-supplier-quote.pdf", {
      type: "application/pdf",
    }),
    onRemove: () => undefined,
  },
}

export const WithoutRemoveAction: Story = {
  args: {
    fileName: "locked-quote.pdf",
    file: new File(["%PDF-1.4 sample"], "locked-quote.pdf", {
      type: "application/pdf",
    }),
  },
}
