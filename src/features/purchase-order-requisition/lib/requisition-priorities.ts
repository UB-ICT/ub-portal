export type RequisitionPriority = "standard" | "urgent" | "critical"

export type RequisitionPriorityConfig = {
  value: RequisitionPriority
  label: string
  description: string
  dotClassName: string
  badgeClassName: string
}

export const REQUISITION_PRIORITIES: RequisitionPriorityConfig[] = [
  {
    value: "standard",
    label: "Standard",
    description: "Needed within the normal procurement timeline",
    dotClassName: "bg-blue-500",
    badgeClassName:
      "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200",
  },
  {
    value: "urgent",
    label: "Urgent",
    description: "Needed soon; delay may affect operations",
    dotClassName: "bg-amber-500",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  {
    value: "critical",
    label: "Critical",
    description:
      "Immediate need; delay may stop operations, classes, services, or compliance",
    dotClassName: "bg-red-500",
    badgeClassName:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
  },
]

const LEGACY_PRIORITY_MAP: Record<string, RequisitionPriority> = {
  low: "standard",
  routine: "standard",
  medium: "standard",
  high: "urgent",
}

export function normalizeRequisitionPriority(
  value?: string | null
): RequisitionPriority {
  if (!value) {
    return "standard"
  }

  const normalized = value.toLowerCase()

  if (normalized in LEGACY_PRIORITY_MAP) {
    return LEGACY_PRIORITY_MAP[normalized]
  }

  const match = REQUISITION_PRIORITIES.find(
    (priority) => priority.value === normalized
  )

  return match?.value ?? "standard"
}

export function getRequisitionPriorityConfig(
  value?: string | null
): RequisitionPriorityConfig {
  const normalized = normalizeRequisitionPriority(value)
  return (
    REQUISITION_PRIORITIES.find((priority) => priority.value === normalized) ??
    REQUISITION_PRIORITIES[0]
  )
}
