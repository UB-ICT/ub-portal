import { Building2, CalendarDays, CircleDollarSign } from "lucide-react"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { RequisitionPriority } from "@/features/purchase-order-requisition/lib/requisition-priorities"
import {
  getRequisitionStatusStyles,
  REQUISITION_STATUS_LABELS,
  type RequisitionStatus,
} from "@/features/purchase-order-requisition/lib/requisition-status"

import { PriorityBadge } from "./PriorityBadge"
import { RequisitionNumberBadge } from "./RequisitionNumberBadge"

export type { RequisitionStatus }

export type RequisitionCardProps = {
  referenceNumber: string
  department: string
  date: string
  status: RequisitionStatus
  priority?: RequisitionPriority | string
  costCenter: string
  amount: number
  selected?: boolean
  className?: string
  onClick?: () => void
}

function formatDate(dateString: string) {
  const parsed = new Date(dateString)

  if (Number.isNaN(parsed.getTime())) {
    return dateString
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

type DetailFieldProps = {
  icon: ReactNode
  label: string
  value: string
}

function DetailField({ icon, label, value }: DetailFieldProps) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/25 px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="inline-flex size-4 shrink-0 items-center justify-center text-primary/80">
          {icon}
        </span>
        {label}
      </div>
      <p className="text-sm leading-snug font-medium text-foreground">{value}</p>
    </div>
  )
}

export function RequisitionCard({
  referenceNumber,
  department,
  date,
  status,
  priority,
  costCenter,
  amount,
  selected = false,
  className,
  onClick,
}: RequisitionCardProps) {
  const isInteractive = Boolean(onClick)
  const statusStyles = getRequisitionStatusStyles(status)

  return (
    <Card
      className={cn(
        "gap-0 border-l-4 py-0 shadow-sm transition-all",
        statusStyles.accent,
        selected && "border-primary/60 ring-2 ring-primary/20",
        isInteractive &&
          "cursor-pointer hover:border-primary/40 hover:bg-muted/15 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      <CardHeader className="gap-2 border-b bg-muted/15 p-3 [.border-b]:pb-3">
        <CardTitle className="leading-tight">
          <RequisitionNumberBadge number={referenceNumber} status={status} />
        </CardTitle>
        <CardDescription className="inline-flex items-center gap-1.5 text-sm">
          <CalendarDays className="size-4 shrink-0" />
          {formatDate(date)}
        </CardDescription>
        <CardAction>
          <div className="flex flex-col items-end gap-1.5">
            <Badge
              variant="secondary"
              className="h-6 px-2.5 text-xs font-semibold tabular-nums"
            >
              {formatAmount(amount)}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "h-6 px-2.5 text-xs font-medium capitalize",
                statusStyles.badge
              )}
            >
              {REQUISITION_STATUS_LABELS[status]}
            </Badge>
            {priority ? <PriorityBadge priority={priority} /> : null}
          </div>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-2 p-3">
        <DetailField
          icon={<Building2 className="size-3.5" />}
          label="Department"
          value={department}
        />
        <DetailField
          icon={<CircleDollarSign className="size-3.5" />}
          label="Cost center"
          value={costCenter}
        />
      </CardContent>
    </Card>
  )
}
