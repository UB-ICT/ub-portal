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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = applications.findIndex((item) => item.id === active.id)
    const newIndex = applications.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
              >
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
