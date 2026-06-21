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

import { PriorityBadge } from "./PriorityBadge"

export type RequisitionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "in-review"
  | "cancelled"

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

const STATUS_LABELS: Record<RequisitionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  "in-review": "In review",
  cancelled: "Cancelled",
}

function getStatusStyles(status: RequisitionStatus) {
  switch (status) {
    case "approved":
      return {
        accent: "border-l-green-500",
        badge:
          "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200",
      }
    case "pending":
      return {
        accent: "border-l-amber-500",
        badge:
          "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
      }
    case "in-review":
      return {
        accent: "border-l-blue-500",
        badge:
          "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200",
      }
    case "rejected":
      return {
        accent: "border-l-red-500",
        badge:
          "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
      }
    case "cancelled":
      return {
        accent: "border-l-slate-400",
        badge:
          "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
      }
    default:
      return {
        accent: "border-l-border",
        badge: "",
      }
  }
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
  const statusStyles = getStatusStyles(status)

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
        <CardTitle className="font-mono text-base font-semibold leading-tight tracking-tight">
          {referenceNumber}
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
              {STATUS_LABELS[status]}
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
