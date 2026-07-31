import type { ChartOfAccount } from "@/lib/api/chart-of-accounts"

export type AccountSortField = "account_no" | "description"

export type AccountSearchCriteria = {
  query: string
  sortBy: AccountSortField
  sortDirection: "asc" | "desc"
}

export type AccountTreeRow = ChartOfAccount & {
  depth: number
}

export const DEFAULT_ACCOUNT_SEARCH: AccountSearchCriteria = {
  query: "",
  sortBy: "account_no",
  sortDirection: "asc",
}

function compareAccounts(
  left: ChartOfAccount,
  right: ChartOfAccount,
  sortBy: AccountSortField,
  direction: 1 | -1
) {
  const leftValue = String(left[sortBy] ?? "")
  const rightValue = String(right[sortBy] ?? "")
  return leftValue.localeCompare(rightValue) * direction
}

/**
 * Flatten accounts into parent-then-children order with nesting depth.
 * Orphans whose parent is missing from the set are treated as roots.
 */
export function toAccountTree(
  accounts: ChartOfAccount[],
  sortBy: AccountSortField = "account_no",
  sortDirection: "asc" | "desc" = "asc"
): AccountTreeRow[] {
  const direction = sortDirection === "desc" ? -1 : 1
  const byId = new Map(accounts.map((account) => [account.id, account]))
  const children = new Map<number | null, ChartOfAccount[]>()

  for (const account of accounts) {
    const parentId =
      account.parent_id && byId.has(account.parent_id)
        ? account.parent_id
        : null
    const siblings = children.get(parentId) ?? []
    siblings.push(account)
    children.set(parentId, siblings)
  }

  for (const siblings of children.values()) {
    siblings.sort((left, right) =>
      compareAccounts(left, right, sortBy, direction)
    )
  }

  const rows: AccountTreeRow[] = []

  const visit = (parentId: number | null, depth: number) => {
    const siblings = children.get(parentId) ?? []

    for (const account of siblings) {
      rows.push({ ...account, depth })
      visit(account.id, depth + 1)
    }
  }

  visit(null, 0)

  return rows
}

export function filterAndSortAccounts(
  accounts: ChartOfAccount[],
  criteria: AccountSearchCriteria
): AccountTreeRow[] {
  const tree = toAccountTree(accounts, criteria.sortBy, criteria.sortDirection)
  const query = criteria.query.trim().toLowerCase()

  if (!query) {
    return tree
  }

  const byId = new Map(accounts.map((account) => [account.id, account]))
  const matchingIds = new Set<number>()

  for (const account of tree) {
    const haystack = `${account.account_no} ${account.description}`.toLowerCase()

    if (haystack.includes(query)) {
      matchingIds.add(account.id)
    }
  }

  // Keep ancestors so nested matches stay visually under their parents.
  for (const account of tree) {
    if (!matchingIds.has(account.id)) {
      continue
    }

    let parentId = account.parent_id

    while (parentId) {
      matchingIds.add(parentId)
      parentId = byId.get(parentId)?.parent_id ?? null
    }
  }

  return tree.filter((account) => matchingIds.has(account.id))
}

export function getDescendantAccountIds(
  accounts: ChartOfAccount[],
  accountId: number
): number[] {
  const children = new Map<number, number[]>()

  for (const account of accounts) {
    if (account.parent_id == null) {
      continue
    }

    const siblings = children.get(account.parent_id) ?? []
    siblings.push(account.id)
    children.set(account.parent_id, siblings)
  }

  const ids: number[] = []
  const queue = [...(children.get(accountId) ?? [])]

  while (queue.length > 0) {
    const childId = queue.shift()!

    ids.push(childId)
    queue.push(...(children.get(childId) ?? []))
  }

  return ids
}

export function formatAccountOptionLabel(
  account: ChartOfAccount,
  depth = 0
): string {
  const indent = depth > 0 ? `${"— ".repeat(depth)}` : ""
  return `${indent}${account.account_no} — ${account.description}`
}
