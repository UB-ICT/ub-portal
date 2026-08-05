import {
  RequisitionCard,
  type RequisitionCardProps,
} from "./RequisitionCard"
import { cn } from "@/lib/utils"

export type RequisitionListItem = RequisitionCardProps & {
  id: number
  supplier: string
}

export const MOCK_REQUISITIONS: RequisitionListItem[] = [
  {
    id: 1,
    referenceNumber: "000000001",
    supplier: "Acme Office Supplies",
    department: "Finance",
    date: "2026-06-01",
    status: "approved",
    costCenter: "CC-4100-OPS",
    amount: 15000,
  },
  {
    id: 2,
    referenceNumber: "000000002",
    supplier: "Belize Tech Solutions",
    department: "Information Technology",
    date: "2026-05-28",
    status: "in-review",
    costCenter: "CC-2200-IT",
    amount: 45000.5,
  },
  {
    id: 3,
    referenceNumber: "000000003",
    supplier: "Caribbean Furniture Co.",
    department: "Facilities",
    date: "2026-05-25",
    status: "pending",
    costCenter: "CC-3300-FAC",
    amount: 8500.75,
  },
  {
    id: 4,
    referenceNumber: "000000004",
    supplier: "Maintenance Pro Ltd.",
    department: "Human Resources",
    date: "2026-05-20",
    status: "rejected",
    costCenter: "CC-1200-HR",
    amount: 2200,
  },
  {
    id: 5,
    referenceNumber: "000000005",
    supplier: "Acme Office Supplies",
    department: "Academic Affairs",
    date: "2026-05-18",
    status: "approved",
    costCenter: "CC-5100-ACA",
    amount: 72000,
  },
  {
    id: 6,
    referenceNumber: "000000006",
    supplier: "Belize Tech Solutions",
    department: "Finance",
    date: "2026-05-12",
    status: "pending",
    costCenter: "CC-4100-OPS",
    amount: 12450,
  },
]

type ListRequisitionsProps = {
  requisitions?: RequisitionListItem[]
  selectedRequisitionId?: number | null
  onRequisitionClick?: (id: number) => void
  className?: string
}

export function ListRequisitions({
  requisitions = MOCK_REQUISITIONS,
  selectedRequisitionId = null,
  onRequisitionClick,
  className,
}: ListRequisitionsProps) {
  if (requisitions.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-dashed bg-muted/20 p-2 text-center",
          className
        )}
      >
        <div className="flex flex-1 items-center justify-center">
          <div>
            <p className="text-sm font-medium text-foreground">
              No requisitions found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search filters.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("mt-2 flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <div className="mb-2 shrink-0 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {requisitions.length} result{requisitions.length === 1 ? "" : "s"}
        </p>
      </div>

      <ul className="flex min-h-0 flex-1 list-none flex-col gap-2 overflow-y-auto overscroll-y-contain">
        {requisitions.map(({ supplier: _supplier, id, ...requisition }) => (
          <li key={id}>
            <RequisitionCard
              {...requisition}
              selected={selectedRequisitionId === id}
              onClick={
                onRequisitionClick ? () => onRequisitionClick(id) : undefined
              }
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
