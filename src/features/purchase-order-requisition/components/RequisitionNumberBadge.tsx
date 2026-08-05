import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getRequisitionStatusStyles,
  type RequisitionStatus,
} from "@/features/purchase-order-requisition/lib/requisition-status"

type RequisitionNumberBadgeProps = {
  number: string
  status?: RequisitionStatus | string | null
  className?: string
}

function resolveStatus(
  status?: RequisitionStatus | string | null
): RequisitionStatus {
  if (
    status === "pending" ||
    status === "approved" ||
    status === "rejected" ||
    status === "in-review" ||
    status === "cancelled" ||
    status === "closed"
  ) {
    return status
  }

  return "pending"
}

export function RequisitionNumberBadge({
  number,
  status,
  className,
}: RequisitionNumberBadgeProps) {
  const styles = getRequisitionStatusStyles(resolveStatus(status))

  return (
    <Badge
      variant="outline"
      title={`Requisition number ${number}`}
      className={cn(
        "h-7 px-2.5 font-mono text-xs font-semibold tracking-wide tabular-nums",
        styles.badge,
        className
      )}
    >
      {number}
    </Badge>
  )
}
