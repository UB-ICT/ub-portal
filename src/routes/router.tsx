import { createBrowserRouter } from "react-router-dom"

import { DashboardPage } from "@/pages/DashboardPage"
import { LoginPage } from "@/pages/LoginPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ApplicationLayout } from "@/routes/ApplicationLayout"
import { PortalLayout } from "@/routes/PortalLayout"
import { AdminLayout } from "@/routes/AdminLayout"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { RootRoute } from "@/routes/RootRoute"
import { AdminDashboard } from "@/features/identitiy-cloud/pages/AdminDashboard"
import { AdminApplicationsPage } from "@/features/identitiy-cloud/pages/AdminApplications"
import { AdminUsersPage } from "@/features/identitiy-cloud/pages/AdminUsers"
import { AdminRolesPage } from "@/features/identitiy-cloud/pages/AdminRoles"
import { PORDashboardPage } from "@/features/purchase-order-requisition/pages/PORDashboard"
import { PORSuppliersPage } from "@/features/purchase-order-requisition/pages/PORSuppliers"
import { PORRequisitionsPage } from "@/features/purchase-order-requisition/pages/PORRequisitions"
import { PORReportsPage } from "@/features/purchase-order-requisition/pages/PORReports"

export const router = createBrowserRouter([
  {
    element: <RootRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/",
        element: <ProtectedRoute />,
        children: [
          {
            element: <PortalLayout />,
            children: [
              {
                index: true,
                element: <DashboardPage />,
              },
            ],
          },
          {
            path: "admin",
            element: <AdminLayout />,
            children: [
              {
                path: "/admin",
                element: <AdminDashboard />,
              },
              {
                path: "/admin/apps",
                element: <AdminApplicationsPage />,
              },
              {
                path: "/admin/users",
                element: <AdminUsersPage />,
              },
              {
                path: "/admin/roles",
                element: <AdminRolesPage />,
              },
            ],
          },

          {
            path: "requisitions",
            element: <ApplicationLayout />,
            children: [
              {
                path: "",
                element: <PORDashboardPage />,
              },
              {
                path: "forms",
                element: <PORRequisitionsPage />,
              },
              {
                path: "suppliers",
                element: <PORSuppliersPage />,
              },
              {
                path: "reports",
                element: <PORReportsPage />,
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
])
