import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import {
  getRequisitionPriorityConfig,
  type RequisitionPriority,
} from "../lib/requisition-priorities"

type PriorityBadgeProps = {
  priority: RequisitionPriority | string
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = getRequisitionPriorityConfig(priority)

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 gap-1.5 px-2.5 text-xs font-medium",
        config.badgeClassName,
        className
      )}
    >
      <span
        aria-hidden
        className={cn("size-2 shrink-0 rounded-full", config.dotClassName)}
      />
      {config.label}
    </Badge>
  )
}
