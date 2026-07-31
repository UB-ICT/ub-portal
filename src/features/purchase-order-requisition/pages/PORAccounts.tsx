import { Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { UBButton } from "@/components/shared/UBButton"
import type { ChartOfAccount } from "@/lib/api/chart-of-accounts"
import { useChartOfAccountsStore } from "@/store/chart-of-accounts-store"

import {
  DEFAULT_ACCOUNT_SEARCH,
  filterAndSortAccounts,
  type AccountSearchCriteria,
} from "../lib/account-admin-utils"
import { AccountFormDialog } from "../components/AccountFormDialog"
import { AccountsTable } from "../components/AccountsTable"
import { SearchAccounts } from "../components/SearchAccounts"

export function PORAccountsPage() {
  const chartOfAccounts = useChartOfAccountsStore(
    (state) => state.chartOfAccounts
  )
  const isLoading = useChartOfAccountsStore((state) => state.isLoading)
  const isSaving = useChartOfAccountsStore((state) => state.isSaving)
  const error = useChartOfAccountsStore((state) => state.error)
  const fetchChartOfAccounts = useChartOfAccountsStore(
    (state) => state.fetchChartOfAccounts
  )
  const deleteChartOfAccount = useChartOfAccountsStore(
    (state) => state.deleteChartOfAccount
  )

  const [searchCriteria, setSearchCriteria] = useState<AccountSearchCriteria>(
    DEFAULT_ACCOUNT_SEARCH
  )
  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(
    null
  )

  useEffect(() => {
    void fetchChartOfAccounts()
  }, [fetchChartOfAccounts])

  const filteredAccounts = useMemo(
    () => filterAndSortAccounts(chartOfAccounts, searchCriteria),
    [chartOfAccounts, searchCriteria]
  )

  const handleAddAccount = () => {
    setEditingAccount(null)
    setFormOpen(true)
  }

  const handleEditAccount = (account: ChartOfAccount) => {
    setEditingAccount(account)
    setFormOpen(true)
  }

  const handleDeleteAccount = async (account: ChartOfAccount) => {
    const confirmed = window.confirm(
      `Delete account ${account.account_no}? This cannot be undone.`
    )

    if (!confirmed) {
      return
    }

    await deleteChartOfAccount(account.id)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground">
            Manage chart of account numbers and descriptions, including nested
            child accounts under a parent.
          </p>
        </div>
        <UBButton size="sm" onClick={handleAddAccount}>
          <Plus className="size-4" data-icon="inline-start" />
          Add account
        </UBButton>
      </header>

      <SearchAccounts onSearch={setSearchCriteria} />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <AccountsTable
          accounts={filteredAccounts}
          isLoading={isLoading || isSaving}
          onEdit={handleEditAccount}
          onDelete={handleDeleteAccount}
        />
      </div>

      <AccountFormDialog
        open={formOpen}
        account={editingAccount}
        onOpenChange={setFormOpen}
        onSuccess={() => void fetchChartOfAccounts(true)}
      />
    </div>
  )
}
