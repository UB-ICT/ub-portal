import { Pencil, Trash2 } from "lucide-react"

import { UBButton } from "@/components/shared/UBButton"
import { UBTable } from "@/components/shared/UBTable"
import { cn } from "@/lib/utils"

import type { AccountTreeRow } from "../lib/account-admin-utils"

type AccountsTableProps = {
  accounts: AccountTreeRow[]
  isLoading?: boolean
  onEdit: (account: AccountTreeRow) => void
  onDelete: (account: AccountTreeRow) => void
}

export function AccountsTable({
  accounts,
  isLoading = false,
  onEdit,
  onDelete,
}: AccountsTableProps) {
  if (isLoading && accounts.length === 0) {
    return (
      <p className="px-1 text-sm text-muted-foreground">Loading accounts...</p>
    )
  }

  if (!isLoading && accounts.length === 0) {
    return (
      <p className="px-1 text-sm text-muted-foreground">No accounts found.</p>
    )
  }

  return (
    <UBTable
      rowKey="id"
      data={accounts}
      striped
      columns={[
        {
          header: "Account number",
          accessor: "account_no",
          mobile: true,
          render: (value, account) => (
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${account.depth * 1.25}rem` }}
            >
              {account.depth > 0 ? (
                <span
                  aria-hidden
                  className="text-muted-foreground/70 select-none"
                >
                  └
                </span>
              ) : null}
              <span
                className={cn(
                  "tabular-nums",
                  account.depth === 0 ? "font-semibold" : "font-medium"
                )}
              >
                {String(value)}
              </span>
            </div>
          ),
        },
        {
          header: "Description",
          accessor: "description",
          mobile: true,
          render: (value, account) => (
            <div style={{ paddingLeft: `${account.depth * 1.25}rem` }}>
              <span className={account.depth === 0 ? "font-medium" : undefined}>
                {String(value)}
              </span>
              {account.parent ? (
                <p className="text-xs text-muted-foreground">
                  Under {account.parent.account_no}
                </p>
              ) : null}
            </div>
          ),
        },
        {
          header: "Actions",
          accessor: "id",
          className: "w-[1%] whitespace-nowrap",
          mobile: true,
          render: (_, account) => (
            <div className="flex items-center gap-1">
              <UBButton
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Edit ${account.account_no}`}
                onClick={() => onEdit(account)}
              >
                <Pencil className="size-4" />
              </UBButton>
              <UBButton
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Delete ${account.account_no}`}
                onClick={() => onDelete(account)}
              >
                <Trash2 className="size-4 text-destructive" />
              </UBButton>
            </div>
          ),
        },
      ]}
    />
  )
}
