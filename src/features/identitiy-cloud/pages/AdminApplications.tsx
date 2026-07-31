import { useEffect, useState } from "react"

import {
  closestCorners,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"

import { UBButton } from "@/components/shared/UBButton"
import { ApplicationFormDialog } from "@/features/identitiy-cloud/components/ApplicationFormDialog"
import { SortableApplicationCard } from "@/features/identitiy-cloud/components/SortableApplicationCard"
import type { AdminApplicationRecord } from "@/lib/api/admin-applications"
import { useAdminApplicationsStore } from "@/store/admin-applications-store"

export const AdminApplicationsPage = () => {
  const applications = useAdminApplicationsStore((state) => state.applications)
  const isLoading = useAdminApplicationsStore((state) => state.isLoading)
  const isSaving = useAdminApplicationsStore((state) => state.isSaving)
  const error = useAdminApplicationsStore((state) => state.error)
  const fetchCatalog = useAdminApplicationsStore((state) => state.fetchCatalog)
  const updateApplication = useAdminApplicationsStore(
    (state) => state.updateApplication
  )
  const reorderApplications = useAdminApplicationsStore(
    (state) => state.reorderApplications
  )

  // Sensors decide what counts as "starting a drag":
  // - PointerSensor with a distance threshold means the pointer has to move 8px
  //   before a drag starts, so a plain click on the Edit/Activate buttons
  //   inside a card registers as a click, not a drag.
  // - KeyboardSensor lets a focused card be reordered with the keyboard
  //   (space to pick up, arrow keys to move, space to drop) for accessibility.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingApplication, setEditingApplication] =
    useState<AdminApplicationRecord | null>(null)

  useEffect(() => {
    void fetchCatalog()
  }, [fetchCatalog])

  const handleConnectApp = () => {
    setEditingApplication(null)
    setDialogOpen(true)
  }

  const handleEditApp = (application: AdminApplicationRecord) => {
    setEditingApplication(application)
    setDialogOpen(true)
  }

  const handleToggleStatus = async (application: AdminApplicationRecord) => {
    if (application.status === "active") {
      const confirmed = window.confirm(
        `Deactivate "${application.label}"? It will stop appearing in the portal app switcher until reactivated.`
      )

      if (!confirmed) {
        return
      }

      await updateApplication(application.id, { status: "disabled" })
      return
    }

    await updateApplication(application.id, { status: "active" })
  }

  // Fired by DndContext when a drag gesture ends. `active` is the card that
  // was dragged, `over` is whatever card it was dropped on top of.
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // No drop target, or dropped back where it started - nothing to do.
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = applications.findIndex((item) => item.id === active.id)
    const newIndex = applications.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // arrayMove returns a new array with the item moved from oldIndex to
    // newIndex; we only need the resulting id order to hand off to the store.
    const orderedIds = arrayMove(applications, oldIndex, newIndex).map(
      (item) => item.id
    )
    void reorderApplications(orderedIds)
  }

  return (
    <div className="h-full min-h-screen w-full space-y-6 overflow-y-auto p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the applications registered in the portal catalog.
          </p>
        </div>
        <UBButton onClick={handleConnectApp}>Connect app</UBButton>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {isLoading && applications.length === 0 ? (
        <div className="animate-pulse p-8 text-center text-sm font-medium text-muted-foreground">
          Loading applications...
        </div>
      ) : (
        <>
          {isSaving ? (
            <p className="text-sm text-muted-foreground">Saving order...</p>
          ) : null}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {applications.length === 0 ? (
              <div className="col-span-full rounded-lg border bg-card p-6 text-center text-muted-foreground">
                No applications registered yet.
              </div>
            ) : (
              // DndContext is the outer drag-and-drop coordinator: it tracks
              // sensors, figures out which card is being hovered over
              // (closestCorners), and calls handleDragEnd once a drag finishes.
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
              >
                {/* SortableContext tells dnd-kit the current order of ids and
                    which layout algorithm to use for animating cards out of the
                    way while dragging. rectSortingStrategy (rather than
                    verticalListSortingStrategy) is used because this is a grid
                    that reflows into 2 or 3 columns, not a single vertical list. */}
                <SortableContext
                  items={applications.map((application) => application.id)}
                  strategy={rectSortingStrategy}
                >
                  {applications.map((application) => (
                    <SortableApplicationCard
                      key={application.id}
                      application={application}
                      disabled={isLoading || isSaving}
                      onEdit={handleEditApp}
                      onToggleStatus={(app) => void handleToggleStatus(app)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </>
      )}

      <ApplicationFormDialog
        open={dialogOpen}
        application={editingApplication}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}

export default AdminApplicationsPage
