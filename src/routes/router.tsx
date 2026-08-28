import { createBrowserRouter } from "react-router-dom"

import { DashboardPage } from "@/pages/DashboardPage"
import { LoginPage } from "@/pages/LoginPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { AdminLayout } from "@/routes/AdminLayout"
import { ApplicationLayout } from "@/routes/ApplicationLayout"
import { PortalLayout } from "@/routes/PortalLayout"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { RootRoute } from "@/routes/RootRoute"
import { PORDashboardPage } from "@/features/purchase-order-requisition/pages/PORDashboard"
import { PORSuppliersPage } from "@/features/purchase-order-requisition/pages/PORSuppliers"
import { PORAccountsPage } from "@/features/purchase-order-requisition/pages/PORAccounts"
import { PORBudgetsPage } from "@/features/purchase-order-requisition/pages/PORBudgets"
import { PORCostCentersPage } from "@/features/purchase-order-requisition/pages/PORCostCenters"
import { PORPipelinesPage } from "@/features/purchase-order-requisition/pages/PORPipelines"
import { PORReportsPage } from "@/features/purchase-order-requisition/pages/PORReports"
import { PORRequisitionsPage } from "@/features/purchase-order-requisition/pages/PORRequisitions"
import { AdminApplicationsPage } from "@/features/identitiy-cloud/pages/AdminApplications"
import { AdminDashboard } from "@/features/identitiy-cloud/pages/AdminDashboard"
import { AdminMenusPage } from "@/features/identitiy-cloud/pages/AdminMenus"
import { AdminRolesPage } from "@/features/identitiy-cloud/pages/AdminRoles"
import { AdminUsersPage } from "@/features/identitiy-cloud/pages/AdminUsers"

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
                path: "accounts",
                element: <PORAccountsPage />,
              },
              {
                path: "cost-centers",
                element: <PORCostCentersPage />,
              },
              {
                path: "budgets",
                element: <PORBudgetsPage />,
              },
              {
                path: "pipelines",
                element: <PORPipelinesPage />,
              },
              {
                path: "reports",
                element: <PORReportsPage />,
              },
            ],
          },
          {
            path: "admin",
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: <AdminDashboard />,
              },
              {
                path: "users",
                element: <AdminUsersPage />,
              },
              {
                path: "roles",
                element: <AdminRolesPage />,
              },
              {
                path: "menu",
                element: <AdminMenusPage />,
              },
              {
                path: "apps",
                element: <AdminApplicationsPage />,
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
