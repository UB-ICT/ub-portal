import { useEffect, useMemo, useState } from "react"

import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { cn } from "@/lib/utils"
import { useRequisitionsStore } from "@/store/requisitions-store"

import { mapRequisitionRecordToListItem } from "../lib/requisition-mappers"
import { ListRequisitions } from "./ListRequisitions"
import {
  SearchRequisitions,
  type RequisitionSearchCriteria,
} from "./SearchRequisitions"
import { REQUISITION_STATUS_LABELS } from "../lib/requisition-status"
import type { RequisitionListItem } from "./ListRequisitions"

const EMPTY_CRITERIA: RequisitionSearchCriteria = {
  query: "",
  status: "",
}

function getRequisitionSearchText(requisition: RequisitionListItem) {
  const formattedDate = new Date(requisition.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(requisition.amount)

  return [
    requisition.referenceNumber,
    requisition.supplier,
    requisition.department,
    requisition.costCenter,
    requisition.date,
    formattedDate,
    requisition.status,
    REQUISITION_STATUS_LABELS[requisition.status],
    String(requisition.amount),
    formattedAmount,
  ]
    .join(" ")
    .toLowerCase()
}

function filterRequisitions(
  requisitions: RequisitionListItem[],
  criteria: RequisitionSearchCriteria
) {
  const normalizedQuery = criteria.query.toLowerCase()

  return requisitions.filter((requisition) => {
    if (
      normalizedQuery &&
      !getRequisitionSearchText(requisition).includes(normalizedQuery)
    ) {
      return false
    }

    if (criteria.status && requisition.status !== criteria.status) {
      return false
    }

    return true
  })
}

type RequisitionPaneProps = {
  className?: string
  selectedRequisitionId?: number | null
  onRequisitionSelect?: (id: number) => void
}

export function RequisitionPane({
  className,
  selectedRequisitionId = null,
  onRequisitionSelect,
}: RequisitionPaneProps) {
  const requisitions = useRequisitionsStore((state) => state.requisitions)
  const isLoadingList = useRequisitionsStore((state) => state.isLoadingList)
  const fetchRequisitions = useRequisitionsStore((state) => state.fetchRequisitions)
  const [searchCriteria, setSearchCriteria] =
    useState<RequisitionSearchCriteria>(EMPTY_CRITERIA)

  useEffect(() => {
    void fetchRequisitions()
  }, [fetchRequisitions])

  const listItems = useMemo(
    () => requisitions.map(mapRequisitionRecordToListItem),
    [requisitions]
  )

  const filteredRequisitions = useMemo(
    () => filterRequisitions(listItems, searchCriteria),
    [listItems, searchCriteria]
  )

  return (
    <div
      className={cn(
        "flex min-h-0 w-full max-w-[300px] shrink-0 flex-col gap-2 overflow-hidden",
        className
      )}
    >
      <SearchRequisitions className="shrink-0" onSearch={setSearchCriteria} />
      {isLoadingList && listItems.length === 0 ? (
        <LoadingSpinner className="flex-1" label="Loading requisitions..." />
      ) : (
        <ListRequisitions
          className="min-h-0 flex-1 overflow-hidden"
          requisitions={filteredRequisitions}
          selectedRequisitionId={selectedRequisitionId}
          onRequisitionClick={onRequisitionSelect}
        />
      )}
    </div>
  )
}
