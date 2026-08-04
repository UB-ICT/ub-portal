import type { CostCenter } from "@/lib/api/requisitions"

export type CostCenterSortField = "name" | "number"

export type CostCenterSearchCriteria = {
  query: string
  sortBy: CostCenterSortField
  sortDirection: "asc" | "desc"
}

export const DEFAULT_COST_CENTER_SEARCH: CostCenterSearchCriteria = {
  query: "",
  sortBy: "name",
  sortDirection: "asc",
}

export function filterAndSortCostCenters(
  costCenters: CostCenter[],
  criteria: CostCenterSearchCriteria
) {
  const needle = criteria.query.trim().toLowerCase()
  const direction = criteria.sortDirection === "desc" ? -1 : 1

  return costCenters
    .filter((costCenter) => {
      if (!needle) {
        return true
      }

      const haystack = [
        costCenter.name,
        costCenter.number ?? "",
        ...(costCenter.users ?? []).flatMap((user) => [user.name, user.email]),
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(needle)
    })
    .sort((left, right) => {
      if (criteria.sortBy === "number") {
        return (
          (left.number ?? "").localeCompare(right.number ?? "", undefined, {
            numeric: true,
          }) * direction
        )
      }

      return left.name.localeCompare(right.name) * direction
    })
}
