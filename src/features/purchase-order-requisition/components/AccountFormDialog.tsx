import { useEffect, useMemo, useState, type FormEvent } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBInput, UBNativeSelect, UBTextarea } from "@/components/shared/UBInput"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ChartOfAccount } from "@/lib/api/chart-of-accounts"
import { useChartOfAccountsStore } from "@/store/chart-of-accounts-store"

import {
  formatAccountOptionLabel,
  getDescendantAccountIds,
  toAccountTree,
} from "../lib/account-admin-utils"

type AccountFormDialogProps = {
  open: boolean
  account?: ChartOfAccount | null
  onOpenChange: (open: boolean) => void
  onSuccess?: (account: ChartOfAccount) => void
}

export function AccountFormDialog({
  open,
  account,
  onOpenChange,
  onSuccess,
}: AccountFormDialogProps) {
  const chartOfAccounts = useChartOfAccountsStore(
    (state) => state.chartOfAccounts
  )
  const createChartOfAccount = useChartOfAccountsStore(
    (state) => state.createChartOfAccount
  )
  const updateChartOfAccount = useChartOfAccountsStore(
    (state) => state.updateChartOfAccount
  )
  const isSaving = useChartOfAccountsStore((state) => state.isSaving)
  const error = useChartOfAccountsStore((state) => state.error)

  const [accountNo, setAccountNo] = useState("")
  const [description, setDescription] = useState("")
  const [parentId, setParentId] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const isEdit = Boolean(account)

  const parentOptions = useMemo(() => {
    const excludedIds = new Set<number>()

    if (account) {
      excludedIds.add(account.id)
      for (const id of getDescendantAccountIds(chartOfAccounts, account.id)) {
        excludedIds.add(id)
      }
    }

    const eligible = chartOfAccounts.filter(
      (item) => !excludedIds.has(item.id)
    )

    return [
      { value: "", label: "None (top-level account)" },
      ...toAccountTree(eligible).map((item) => ({
        value: String(item.id),
        label: formatAccountOptionLabel(item, item.depth),
      })),
    ]
  }, [account, chartOfAccounts])

  useEffect(() => {
    if (!open) {
      return
    }

    setAccountNo(account?.account_no ?? "")
    setDescription(account?.description ?? "")
    setParentId(account?.parent_id ? String(account.parent_id) : "")
    setFormError(null)
  }, [open, account])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)

    if (!accountNo.trim()) {
      setFormError("Account number is required.")
      return
    }

    if (!description.trim()) {
      setFormError("Description is required.")
      return
    }

    const payload = {
      account_no: accountNo.trim(),
      description: description.trim(),
      parent_id: parentId ? Number(parentId) : null,
    }

    const saved =
      isEdit && account
        ? await updateChartOfAccount(account.id, payload)
        : await createChartOfAccount(payload)

    if (!saved) {
      return
    }

    onSuccess?.(saved)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit account" : "Add account"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the account number, description, or parent account."
              : "Create an account with a number, description, and optional parent."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <UBInput
            label="Account number"
            value={accountNo}
            onChange={(event) => setAccountNo(event.target.value)}
            maxLength={20}
            required
          />
          <UBTextarea
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            required
          />
          <UBNativeSelect
            label="Parent account"
            options={parentOptions}
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
          />

          {formError || error ? (
            <p className="text-sm text-destructive">{formError ?? error}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <UBButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </UBButton>
            <UBButton type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : isEdit ? "Save changes" : "Create account"}
            </UBButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
