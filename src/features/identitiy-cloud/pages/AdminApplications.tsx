import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { UBButton } from "@/components/shared/UBButton"
import { ApplicationFormDialog } from "@/features/identitiy-cloud/components/ApplicationFormDialog"
import type {
  AdminApplicationRecord,
  AdminApplicationStatus,
} from "@/lib/api/admin-applications"
import { useAdminApplicationsStore } from "@/store/admin-applications-store"

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

export const AdminApplicationsPage = () => {
  const applications = useAdminApplicationsStore((state) => state.applications)
  const isLoading = useAdminApplicationsStore((state) => state.isLoading)
  const error = useAdminApplicationsStore((state) => state.error)
  const fetchCatalog = useAdminApplicationsStore((state) => state.fetchCatalog)
  const updateApplication = useAdminApplicationsStore(
    (state) => state.updateApplication
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {applications.length === 0 ? (
            <div className="col-span-full rounded-lg border bg-card p-6 text-center text-muted-foreground">
              No applications registered yet.
            </div>
          ) : (
            applications.map((application) => (
              <div
                key={application.id}
                className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm"
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
                  <UBButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditApp(application)}
                  >
                    Edit
                  </UBButton>
                  <UBButton
                    variant={
                      application.status === "active" ? "outline" : "default"
                    }
                    size="sm"
                    onClick={() => void handleToggleStatus(application)}
                  >
                    {application.status === "active"
                      ? "Deactivate"
                      : "Activate"}
                  </UBButton>
                </div>
              </div>
            ))
          )}
        </div>
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
