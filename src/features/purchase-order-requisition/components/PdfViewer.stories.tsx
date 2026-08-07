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
    "File button that opens a dialog with PDF preview, plus download and remove actions. Used for supplier quote PDFs and activity-log supporting documents."
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

export const SupportingDocumentLocalFile: Story = {
  name: "Supporting document (local file)",
  args: {
    fileName: "supporting-cost-estimate.pdf",
    file: new File(
      ["%PDF-1.4 supporting document"],
      "supporting-cost-estimate.pdf",
      { type: "application/pdf" }
    ),
    onRemove: () => undefined,
    previewDescription: "Supporting PDF preview",
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

export const RemoteAttachmentLoader: Story = {
  name: "Remote attachment (View / Download loaders)",
  args: {
    fileName: "posted-supporting-document.pdf",
    previewDescription: "Supporting document attached to this comment",
    loadBlob: async () =>
      new Blob(["%PDF-1.4 remote supporting document"], {
        type: "application/pdf",
      }),
    downloadBlob: async () =>
      new Blob(["%PDF-1.4 remote supporting document"], {
        type: "application/pdf",
      }),
  },
  beforeEach: () => {
    window.localStorage.setItem("ub-portal.access-token", "storybook-token")
  },
}
