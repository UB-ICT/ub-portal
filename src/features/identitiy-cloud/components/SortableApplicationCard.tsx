import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Badge } from "@/components/ui/badge"
import { UBButton } from "@/components/shared/UBButton"
import type {
  AdminApplicationRecord,
  AdminApplicationStatus,
} from "@/lib/api/admin-applications"
import { cn } from "@/lib/utils"

const STATUS_LABELS: Record<AdminApplicationStatus, string> = {
  active: "Active",
  maintenance: "Maintenance",
  disabled: "Disabled",
}

const STATUS_BADGE_CLASSES: Record<AdminApplicationStatus, string> = {
  active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  maintenance:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  disabled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
}

type SortableApplicationCardProps = {
  application: AdminApplicationRecord
  disabled?: boolean
  onEdit: (application: AdminApplicationRecord) => void
  onToggleStatus: (application: AdminApplicationRecord) => void
}

// A single draggable/sortable card in the AdminApplications grid. The whole
// card is the drag surface (no separate drag handle) - dnd-kit's useSortable
// hook wires up everything needed to pick it up, drag it, and drop it.
export function SortableApplicationCard({
  application,
  disabled,
  onEdit,
  onToggleStatus,
}: SortableApplicationCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: application.id, disabled })

  // useSortable reports how far this card should currently be offset (while a
  // drag is in progress, elsewhere in the list) - CSS.Transform.toString turns
  // that into an inline `transform` style so the card visually slides into place.
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex flex-col rounded-2xl border bg-card p-6 shadow-sm",
        disabled ? "cursor-default" : "cursor-grab touch-none active:cursor-grabbing",
        // Lift the card being dragged above its neighbors and fade it slightly.
        isDragging && "z-10 opacity-70 shadow-lg"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {application.label}
        </h3>
        <Badge className={STATUS_BADGE_CLASSES[application.status]}>
          {STATUS_LABELS[application.status]}
        </Badge>
      </div>

      {application.category ? (
        <Badge variant="outline" className="mt-2 w-fit">
          {application.category}
        </Badge>
      ) : null}

      <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
        {application.description || "No description provided."}
      </p>

      <p className="mt-3 text-xs text-muted-foreground">
        Path: {application.path}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <UBButton variant="outline" size="sm" onClick={() => onEdit(application)}>
          Edit
        </UBButton>
        <UBButton
          variant={application.status === "active" ? "outline" : "default"}
          size="sm"
          onClick={() => onToggleStatus(application)}
        >
          {application.status === "active" ? "Deactivate" : "Activate"}
        </UBButton>
      </div>
    </div>
  )
}
