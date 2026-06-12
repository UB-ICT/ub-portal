import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { AppProviders } from "@/app/AppProviders"
import { syncAuthCallbackFromSearch } from "@/lib/auth/storage"

syncAuthCallbackFromSearch(window.location.search)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
)
