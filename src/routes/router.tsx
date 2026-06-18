import { createBrowserRouter } from "react-router-dom"

import { DashboardPage } from "@/pages/DashboardPage"
import { LoginPage } from "@/pages/LoginPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ApplicationLayout } from "@/routes/ApplicationLayout"
import { PortalLayout } from "@/routes/PortalLayout"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { RootRoute } from "@/routes/RootRoute"
import { PORDashboardPage } from "@/features/purchase-order-requisition/pages/PORDashboard"
import { PORSuppliersPage } from "@/features/purchase-order-requisition/pages/PORSuppliers"
import { PORRequisitionsPage } from "@/features/purchase-order-requisition/pages/PORRequisitions"

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
