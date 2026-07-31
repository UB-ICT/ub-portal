import { Plus, X } from "lucide-react"
import { useEffect, useMemo, useState, type KeyboardEvent } from "react"

import { UBButton } from "@/components/shared/UBButton"
import { UBTag } from "@/components/shared/UBTag"
import { createTag, fetchTags, type RequisitionTag } from "@/lib/api/tags"
import { cn } from "@/lib/utils"

type RequisitionTagPickerProps = {
  costCenterId: number | null
  selectedTags: RequisitionTag[]
  onChange: (tags: RequisitionTag[]) => void
  disabled?: boolean
  className?: string
}

export function RequisitionTagPicker({
  costCenterId,
  selectedTags,
  onChange,
  disabled = false,
  className,
}: RequisitionTagPickerProps) {
  const [availableTags, setAvailableTags] = useState<RequisitionTag[]>([])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!costCenterId) {
      setAvailableTags([])
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const tags = await fetchTags(costCenterId)
        if (!cancelled) {
          setAvailableTags(tags)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load tags."
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [costCenterId])

  const selectedIds = useMemo(
    () => new Set(selectedTags.map((tag) => tag.id)),
    [selectedTags]
  )

  const normalizedQuery = query.trim().toLowerCase()

  const matchingTags = useMemo(() => {
    if (!normalizedQuery) {
      return availableTags.filter((tag) => !selectedIds.has(tag.id))
    }

    return availableTags.filter(
      (tag) =>
        !selectedIds.has(tag.id) &&
        tag.name.toLowerCase().includes(normalizedQuery)
    )
  }, [availableTags, normalizedQuery, selectedIds])

  const exactMatch = useMemo(
    () =>
      availableTags.find(
        (tag) => tag.name.toLowerCase() === normalizedQuery
      ) ?? null,
    [availableTags, normalizedQuery]
  )

  const canCreate =
    Boolean(costCenterId) &&
    !disabled &&
    normalizedQuery.length > 0 &&
    !exactMatch

  const selectTag = (tag: RequisitionTag) => {
    if (selectedIds.has(tag.id)) {
      return
    }

    onChange([...selectedTags, tag])
    setQuery("")
  }

  const removeTag = (tagId: number) => {
    onChange(selectedTags.filter((tag) => tag.id !== tagId))
  }

  const handleCreate = async () => {
    if (!costCenterId || !canCreate) {
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const tag = await createTag({
        name: query.trim(),
        cost_center_id: costCenterId,
      })

      setAvailableTags((current) => {
        if (current.some((item) => item.id === tag.id)) {
          return current
        }

        return [...current, tag].sort((left, right) =>
          left.name.localeCompare(right.name)
        )
      })

      selectTag(tag)
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create tag."
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()

      if (exactMatch && !selectedIds.has(exactMatch.id)) {
        selectTag(exactMatch)
        return
      }

      if (matchingTags.length === 1) {
        selectTag(matchingTags[0])
        return
      }

      if (canCreate) {
        void handleCreate()
      }
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Tags
      </p>

      <div className="flex flex-wrap gap-2">
        {selectedTags.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            {disabled ? "No tags" : "No tags selected"}
          </span>
        ) : (
          selectedTags.map((tag) => (
            <UBTag
              key={tag.id}
              text={tag.name}
              variant="primary"
              selected
              interactive={!disabled}
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  removeTag(tag.id)
                }
              }}
              icon={
                disabled ? undefined : <X className="size-3.5" aria-hidden />
              }
              aria-label={
                disabled ? tag.name : `Remove tag ${tag.name}`
              }
            />
          ))
        )}
      </div>

      {!disabled && costCenterId ? (
        <div className="space-y-2 rounded-xl border bg-card p-3">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or create a tag"
              disabled={isCreating || isLoading}
              className="min-w-[12rem] flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {canCreate ? (
              <UBButton
                type="button"
                size="sm"
                variant="outline"
                disabled={isCreating}
                onClick={() => void handleCreate()}
              >
                <Plus className="size-4" data-icon="inline-start" />
                Create “{query.trim()}”
              </UBButton>
            ) : null}
          </div>

          {isLoading ? (
            <p className="text-xs text-muted-foreground">Loading tags…</p>
          ) : null}

          {!isLoading && matchingTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matchingTags.slice(0, 12).map((tag) => (
                <UBTag
                  key={tag.id}
                  text={tag.name}
                  variant="neutral"
                  interactive
                  onClick={() => selectTag(tag)}
                  aria-label={`Add tag ${tag.name}`}
                />
              ))}
            </div>
          ) : null}

          {!isLoading &&
          normalizedQuery &&
          matchingTags.length === 0 &&
          !canCreate ? (
            <p className="text-xs text-muted-foreground">
              That tag is already selected.
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
