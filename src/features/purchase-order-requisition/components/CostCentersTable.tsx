import { Pencil, Trash2 } from "lucide-react"

import { UBButton } from "@/components/shared/UBButton"
import { UBTable } from "@/components/shared/UBTable"
import { Badge } from "@/components/ui/badge"
import type { CostCenter } from "@/lib/api/requisitions"

type CostCentersTableProps = {
  costCenters: CostCenter[]
  isLoading?: boolean
  onEdit: (costCenter: CostCenter) => void
  onDelete: (costCenter: CostCenter) => void
}

export function CostCentersTable({
  costCenters,
  isLoading = false,
  onEdit,
  onDelete,
}: CostCentersTableProps) {
  if (isLoading && costCenters.length === 0) {
    return (
      <p className="px-1 text-sm text-muted-foreground">
        Loading cost centers...
      </p>
    )
  }

  if (!isLoading && costCenters.length === 0) {
    return (
      <p className="px-1 text-sm text-muted-foreground">
        No cost centers found.
      </p>
    )
  }

  return (
    <UBTable
      rowKey="id"
      data={costCenters}
      striped
      columns={[
        {
          header: "Number",
          accessor: "number",
          className: "w-[120px]",
          mobile: true,
          render: (value) => (
            <span className="font-mono text-sm text-foreground">
              {value ? String(value) : "—"}
            </span>
          ),
        },
        {
          header: "Name",
          accessor: "name",
          mobile: true,
          render: (value) => (
            <span className="font-medium text-foreground">{String(value)}</span>
          ),
        },
        {
          header: "Users",
          accessor: "users",
          mobile: true,
          render: (_, costCenter) => {
            const users = costCenter.users ?? []

            if (users.length === 0) {
              return (
                <span className="text-sm text-muted-foreground">No users</span>
              )
            }

            return (
              <div className="flex flex-wrap gap-1">
                {users.map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    title={user.email}
                    className="font-normal"
                  >
                    {user.name}
                  </Badge>
                ))}
              </div>
            )
          },
        },
        {
          header: "Actions",
          accessor: "id",
          className: "w-[1%] whitespace-nowrap",
          mobile: true,
          render: (_, costCenter) => (
            <div className="flex items-center gap-1">
              <UBButton
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Edit ${costCenter.name}`}
                onClick={() => onEdit(costCenter)}
              >
                <Pencil className="size-4" />
              </UBButton>
              <UBButton
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Delete ${costCenter.name}`}
                onClick={() => onDelete(costCenter)}
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
