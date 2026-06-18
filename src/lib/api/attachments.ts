import { buildApiUrl } from "@/lib/config"
import { ApiError } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"
import type { Supplier } from "@/lib/api/suppliers"

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type RequisitionAttachment = {
  id: number
  file_name: string
  file_path: string
  uploaded_by: string
  requisition_id: number
  supplier_id: number
  uploaded_at?: string
  is_recommended?: boolean
  quoted_total?: number | string | null
  quote_reference_number?: string | null
  supplier?: Supplier
}

export type RequisitionQuoteUploadMeta = {
  is_recommended?: boolean
  quoted_total?: number | null
  quote_reference_number?: string | null
}

const BASE_PATH = "/requisitionSystem"

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.json()

  if (!response.ok) {
    throw new ApiError(
      typeof payload?.message === "string"
        ? payload.message
        : `Request failed with status ${response.status}.`,
      response.status,
      payload
    )
  }

  return payload as T
}

export function getAttachmentViewUrl(attachmentId: number) {
  return buildApiUrl(`${BASE_PATH}/attachments/${attachmentId}`)
}

export function getAttachmentDownloadUrl(attachmentId: number) {
  return buildApiUrl(`${BASE_PATH}/attachments/${attachmentId}/download`)
}

export async function fetchRequisitionAttachments(requisitionId: number) {
  const response = await fetch(
    buildApiUrl(`${BASE_PATH}/requisitions/${requisitionId}/attachments`),
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  )

  const payload = await parseJsonResponse<ApiResponse<RequisitionAttachment[]>>(
    response
  )

  return payload.data
}

export async function uploadRequisitionQuote(
  requisitionId: number,
  supplierId: number,
  file: File,
  meta?: RequisitionQuoteUploadMeta
) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("supplier_id", String(supplierId))

  if (meta?.is_recommended !== undefined) {
    formData.append("is_recommended", meta.is_recommended ? "1" : "0")
  }

  if (meta?.quoted_total !== undefined && meta.quoted_total !== null) {
    formData.append("quoted_total", String(meta.quoted_total))
  }

  if (meta?.quote_reference_number) {
    formData.append("quote_reference_number", meta.quote_reference_number)
  }

  const response = await fetch(
    buildApiUrl(`${BASE_PATH}/requisitions/${requisitionId}/attachments`),
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    }
  )

  const payload = await parseJsonResponse<ApiResponse<RequisitionAttachment>>(
    response
  )

  return payload.data
}

export async function deleteRequisitionAttachment(attachmentId: number) {
  const response = await fetch(
    buildApiUrl(`${BASE_PATH}/attachments/${attachmentId}`),
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    }
  )

  await parseJsonResponse<ApiResponse<null>>(response)
}

export async function fetchAttachmentBlob(attachmentId: number) {
  const response = await fetch(getAttachmentViewUrl(attachmentId), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })

  if (!response.ok) {
    throw new ApiError(
      "Failed to load attachment.",
      response.status,
      await response.text()
    )
  }

  return response.blob()
}

export async function downloadRequisitionAttachment(attachmentId: number) {
  const response = await fetch(getAttachmentDownloadUrl(attachmentId), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })

  if (!response.ok) {
    throw new ApiError(
      "Failed to download attachment.",
      response.status,
      await response.text()
    )
  }

  return response.blob()
}
