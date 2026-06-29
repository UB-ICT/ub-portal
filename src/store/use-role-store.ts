import { create } from "zustand"

export type UserRole =
  | "requester"
  | "director-dean"
  | "budget-officer"
  | "vice-president"
  | "director-of-finance"
  | "purchase-officer"

interface RoleState {
  currentRole: UserRole
  setRole: (role: UserRole) => void
}

export const useRoleStore = create<RoleState>((set) => ({
  currentRole: "requester", // default fallback state
  setRole: (role) => set({ currentRole: role }),
}))
