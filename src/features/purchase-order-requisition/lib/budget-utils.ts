import type { BudgetRecord } from "@/lib/api/budgets"

export type BudgetSearchCriteria = {
  query: string
  budgetYearId: number | ""
  status: string
}

export const DEFAULT_BUDGET_SEARCH: BudgetSearchCriteria = {
  query: "",
  budgetYearId: "",
  status: "",
}

/** In-flight statuses — only one of these allowed per cost center. */
export const IN_FLIGHT_BUDGET_STATUSES = ["Draft", "Pending"] as const

/** @deprecated Use IN_FLIGHT_BUDGET_STATUSES */
export const ACTIVE_BUDGET_STATUSES = IN_FLIGHT_BUDGET_STATUSES

export const BUDGET_STATUS_OPTIONS = [
  "Draft",
  "Pending",
  "Approved",
  "Active",
  "Inactive",
] as const

export function isInFlightBudgetStatus(statusName?: string | null) {
  if (!statusName) {
    return false
  }

  return (IN_FLIGHT_BUDGET_STATUSES as readonly string[]).includes(statusName)
}

/** @deprecated Use isInFlightBudgetStatus */
export function isActiveBudgetStatus(statusName?: string | null) {
  return isInFlightBudgetStatus(statusName)
}

export function findActiveBudgetForCostCenter(
  budgets: BudgetRecord[],
  costCenterId: number
) {
  return (
    budgets.find(
      (budget) =>
        budget.cost_center_id === costCenterId &&
        isInFlightBudgetStatus(budget.status?.name)
    ) ?? null
  )
}

export function filterBudgets(
  budgets: BudgetRecord[],
  criteria: BudgetSearchCriteria
) {
  const query = criteria.query.trim().toLowerCase()

  return budgets.filter((budget) => {
    if (
      criteria.budgetYearId &&
      budget.budget_year_id !== criteria.budgetYearId
    ) {
      return false
    }

    if (
      criteria.status &&
      (budget.status?.name ?? "").toLowerCase() !==
        criteria.status.toLowerCase()
    ) {
      return false
    }

    if (!query) {
      return true
    }

    const haystack = [
      budget.cost_center?.name,
      budget.budget_year?.label,
      budget.status?.name,
      budget.stage?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return haystack.includes(query)
  })
}

export function formatBudgetAmount(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return "—"
  }

  const amount = Number(value)

  if (Number.isNaN(amount)) {
    return "—"
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BZD",
    minimumFractionDigits: 2,
  }).format(amount)
}
