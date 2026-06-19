// @/features/purchase-order-requisition/api/useRequisitions.ts
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import type { RequisitionRecord } from "@/lib/api/requisitions"

export function useRequisitions(scope?: string) {
  return useQuery({
    queryKey: ["requisitions", { scope }],
    queryFn: async () => {
      const response = await axios.get<{ success: boolean; data: RequisitionRecord[] }>(
        `/api/requisitions`, 
        { params: { scope } }
      )
      return response.data.data
    }
  })
}