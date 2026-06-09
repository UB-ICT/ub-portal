import { createBrowserRouter } from "react-router-dom"

import { CreatePostPage } from "@/pages/CreatePostPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { LoginPage } from "@/pages/LoginPage"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { RootRoute } from "@/routes/RootRoute"

export const router = createBrowserRouter([
  {
    element: <RootRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "posts/create",
            element: <CreatePostPage />,
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
