import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"
import type { Pipeline, PipelineStageUser } from "@/lib/api/requisitions"

type ApiDataResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type PipelineStagePayload = {
  id?: number | null
  name: string
  sequence: number
  user_ids?: string[]
}

export type PipelinePayload = {
  name: string
  stages?: PipelineStagePayload[]
}

export type StageUsersSyncResult = {
  stage_id: number
  users: PipelineStageUser[]
}

const BASE_PATH = "/requisitionSystem"

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

async function request<T>(endpoint: string, options: RequestInit = {}) {
  const response = await apiRequest<ApiDataResponse<T>>(endpoint, {
    ...options,
    token: getToken(),
  })

  return response.data
}

export async function fetchPipelines() {
  return request<Pipeline[]>(`${BASE_PATH}/pipelines`)
}

export async function fetchPipeline(id: number) {
  return request<Pipeline>(`${BASE_PATH}/pipelines/${id}`)
}

export async function createPipeline(payload: PipelinePayload) {
  return request<Pipeline>(`${BASE_PATH}/pipelines`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updatePipeline(id: number, payload: PipelinePayload) {
  return request<Pipeline>(`${BASE_PATH}/pipelines/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function deletePipeline(id: number) {
  return request<null>(`${BASE_PATH}/pipelines/${id}`, {
    method: "DELETE",
  })
}

export async function syncPipelineStages(
  pipelineId: number,
  stages: PipelineStagePayload[]
) {
  return request<Pipeline>(`${BASE_PATH}/pipelines/${pipelineId}/stages`, {
    method: "PUT",
    body: JSON.stringify({ stages }),
  })
}

export async function syncStageUsers(stageId: number, userIds: string[]) {
  return request<StageUsersSyncResult>(`${BASE_PATH}/stages/${stageId}/users`, {
    method: "PUT",
    body: JSON.stringify({ user_ids: userIds }),
  })
}
