import { apiRequest } from "@/lib/api/client"
import { readStoredAccessToken } from "@/lib/auth/storage"
import type { Pipeline } from "@/lib/api/requisitions"
import type { ChartOfAccount } from "@/lib/api/chart-of-accounts"
import type { CostCenter } from "@/lib/api/requisitions"

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
  meta?: BudgetAccessMeta
}

export type BudgetAccessMeta = {
  is_finance_editor: boolean
  is_cost_center_user: boolean
  can_manage_years: boolean
  can_upload_budget?: boolean
  can_create_budget: boolean
  assigned_cost_centers: CostCenter[]
}

export type BudgetYear = {
  id: number
  label: string
  submissions_open: boolean
}

export type BudgetStatus = {
  id: number
  name: string
}

export type BudgetStage = {
  id: number
  name: string
}

export type BudgetLineItem = {
  id?: number
  chart_of_account_id: number
  amount: number | string
  notes?: string | null
  chart_of_account?: ChartOfAccount
}

export type BudgetUserStageAction =
  | "approved"
  | "rejected"
  | "cost_center_review"

export type BudgetRecord = {
  id: number
  cost_center_id: number
  budget_year_id: number
  pipeline_id?: number | null
  status_id: number
  stage_id: number
  current_stage_sequence?: number | null
  notes?: string | null
  submitted_at?: string | null
  cost_center?: CostCenter
  budget_year?: BudgetYear
  status?: BudgetStatus
  stage?: BudgetStage
  line_items?: BudgetLineItem[]
  can_edit?: boolean
  can_submit?: boolean
  show_approval_actions?: boolean
  can_approve?: boolean
  can_activate?: boolean
  can_deactivate?: boolean
  user_stage_action?: BudgetUserStageAction | null
  pipeline?: Pipeline
}

export type BudgetLineItemPayload = {
  chart_of_account_id: number
  amount: number
  notes?: string | null
}

export type CreateBudgetPayload = {
  cost_center_id: number
  budget_year_id: number
  notes?: string | null
  line_items?: BudgetLineItemPayload[]
  submit?: boolean
  activity_comment?: string | null
}

export type UpdateBudgetPayload = {
  notes?: string | null
  line_items?: BudgetLineItemPayload[]
  submit?: boolean
  activity_comment?: string | null
}

export type BudgetApprovalPayload = {
  comments?: string | null
}

export type BudgetComparisonRow = {
  chart_of_account_id: number
  account_no?: string | null
  description?: string | null
  previous: { amount: number | null; notes: string | null }
  current: { amount: number | null; notes: string | null }
}

export type BudgetComparison = {
  budget: BudgetRecord
  previous_budget: BudgetRecord | null
  years: {
    previous: string | null
    current: string
  }
  rows: BudgetComparisonRow[]
}

export type BudgetLogAction =
  | "created"
  | "updated"
  | "submitted"
  | "approved"
  | "rejected"
  | "comment"
  | "cost_center_review"
  | "activated"
  | "deactivated"
  | "submissions_opened"
  | "submissions_closed"

export type BudgetLogEntry = {
  id: number
  budget_id: number
  user_id: string
  action: BudgetLogAction
  summary: string | null
  comments: string | null
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string
    email: string
  } | null
}

const BUDGETS_PATH = "/requisitionSystem/budgets"
const YEARS_PATH = "/requisitionSystem/budgetYears"

function getToken(token = readStoredAccessToken()) {
  if (!token) {
    throw new Error("No stored access token is available.")
  }

  return token
}

async function request<T>(endpoint: string, options: RequestInit = {}) {
  const response = await apiRequest<ApiResponse<T>>(endpoint, {
    ...options,
    token: getToken(),
  })

  return response.data
}

export async function fetchBudgetYears(): Promise<{
  years: BudgetYear[]
  meta: BudgetAccessMeta | null
}> {
  const response = await apiRequest<ApiResponse<BudgetYear[]>>(YEARS_PATH, {
    token: getToken(),
  })

  return {
    years: response.data,
    meta: response.meta ?? null,
  }
}

export async function createBudgetYear(payload: {
  label: string
  submissions_open?: boolean
}) {
  return request<BudgetYear>(YEARS_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function openBudgetYearSubmissions(id: number) {
  return request<BudgetYear>(`${YEARS_PATH}/${id}/open-submissions`, {
    method: "POST",
    body: JSON.stringify({}),
  })
}

export async function closeBudgetYearSubmissions(id: number) {
  return request<BudgetYear>(`${YEARS_PATH}/${id}/close-submissions`, {
    method: "POST",
    body: JSON.stringify({}),
  })
}

export async function fetchBudgets(params?: {
  budget_year_id?: number
  cost_center_id?: number
}) {
  const search = new URLSearchParams()

  if (params?.budget_year_id) {
    search.set("budget_year_id", String(params.budget_year_id))
  }

  if (params?.cost_center_id) {
    search.set("cost_center_id", String(params.cost_center_id))
  }

  const query = search.toString()

  return request<BudgetRecord[]>(
    query ? `${BUDGETS_PATH}?${query}` : BUDGETS_PATH
  )
}

export async function fetchBudget(id: number) {
  return request<BudgetRecord>(`${BUDGETS_PATH}/${id}`)
}

export async function fetchBudgetComparison(id: number) {
  return request<BudgetComparison>(`${BUDGETS_PATH}/${id}/comparison`)
}

export async function createBudget(payload: CreateBudgetPayload) {
  return request<BudgetRecord>(BUDGETS_PATH, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export type BudgetImportPayload = {
  file: File
  cost_center_id: number
  budget_year_id: number
  notes?: string | null
  status?: "Draft" | "Pending" | "Approved" | "Active" | "Inactive"
  sync_accounts?: boolean
}

export type BudgetImportResult = {
  budget: BudgetRecord
  message: string
  accounts_synced: number
  line_items: number
  total: number
}

export async function importBudgetFromSpreadsheet(
  payload: BudgetImportPayload
): Promise<BudgetImportResult> {
  const formData = new FormData()
  formData.append("file", payload.file)
  formData.append("cost_center_id", String(payload.cost_center_id))
  formData.append("budget_year_id", String(payload.budget_year_id))

  if (payload.notes) {
    formData.append("notes", payload.notes)
  }

  if (payload.status) {
    formData.append("status", payload.status)
  }

  if (payload.sync_accounts !== undefined) {
    formData.append("sync_accounts", payload.sync_accounts ? "1" : "0")
  }

  const response = await apiRequest<
    ApiResponse<BudgetRecord> & {
      meta?: {
        accounts_synced?: number
        line_items?: number
        total?: number
      }
    }
  >(`${BUDGETS_PATH}/import`, {
    method: "POST",
    token: getToken(),
    body: formData,
  })

  return {
    budget: response.data,
    message: response.message ?? "Budget imported successfully.",
    accounts_synced: response.meta?.accounts_synced ?? 0,
    line_items: response.meta?.line_items ?? 0,
    total: response.meta?.total ?? 0,
  }
}

export async function updateBudget(id: number, payload: UpdateBudgetPayload) {
  return request<BudgetRecord>(`${BUDGETS_PATH}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function deleteBudget(id: number) {
  return apiRequest<ApiResponse<null>>(`${BUDGETS_PATH}/${id}`, {
    method: "DELETE",
    token: getToken(),
  })
}

export async function submitBudget(
  id: number,
  payload: BudgetApprovalPayload = {}
) {
  return request<BudgetRecord>(`${BUDGETS_PATH}/${id}/submit`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function approveBudget(
  id: number,
  payload: BudgetApprovalPayload = {}
) {
  return request<BudgetRecord>(`${BUDGETS_PATH}/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function rejectBudget(
  id: number,
  payload: BudgetApprovalPayload = {}
) {
  return request<BudgetRecord>(`${BUDGETS_PATH}/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function requestBudgetReview(
  id: number,
  payload: BudgetApprovalPayload = {}
) {
  return request<BudgetRecord>(`${BUDGETS_PATH}/${id}/request-review`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function activateBudget(
  id: number,
  payload: BudgetApprovalPayload = {}
) {
  return request<BudgetRecord>(`${BUDGETS_PATH}/${id}/activate`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function deactivateBudget(
  id: number,
  payload: BudgetApprovalPayload = {}
) {
  return request<BudgetRecord>(`${BUDGETS_PATH}/${id}/deactivate`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function fetchBudgetLogs(id: number) {
  return request<BudgetLogEntry[]>(`${BUDGETS_PATH}/${id}/logs`)
}

export async function createBudgetLogComment(id: number, comments: string) {
  return request<BudgetLogEntry>(`${BUDGETS_PATH}/${id}/logs`, {
    method: "POST",
    body: JSON.stringify({ comments }),
  })
}
