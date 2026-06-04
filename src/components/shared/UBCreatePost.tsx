import * as React from "react"
import {
  ArrowLeft,
  AtSign,
  Bold,
  ChevronDown,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Sparkles,
  Undo2,
  Upload,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { UBButton } from "./UBButton"

export type UBCreatePostCategory = {
  id: string
  label: string
}

export type UBCreatePostAudience = {
  id: string
  label: string
}

export type UBCreatePostValues = {
  title: string
  body: string
  audienceId: string
  categoryId: string
  thumbnail: File | null
}

export type UBCreatePostProps = {
  audiences?: readonly UBCreatePostAudience[]
  categories?: readonly UBCreatePostCategory[]
  defaultAudienceId?: string
  defaultCategoryId?: string
  isSubmitting?: boolean
  submitLabel?: string
  className?: string
  onBack?: () => void
  onSubmit?: (values: UBCreatePostValues) => void
}

const TITLE_MAX = 250
const BODY_MAX = 10_000

const DEFAULT_AUDIENCES: UBCreatePostAudience[] = [
  { id: "everyone", label: "Everyone" },
  { id: "students", label: "Students" },
  { id: "staff", label: "Staff" },
  { id: "faculty", label: "Faculty" },
]

const DEFAULT_CATEGORIES: UBCreatePostCategory[] = [
  { id: "announcement", label: "Announcement" },
  { id: "academic", label: "Academic" },
  { id: "events", label: "Events" },
  { id: "sports", label: "Sports" },
  { id: "cultural", label: "Cultural" },
  { id: "career", label: "Career" },
]

function ToolbarButton({
  onClick,
  label,
  children,
}: {
  onClick?: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function UBCreatePost({
  audiences = DEFAULT_AUDIENCES,
  categories = DEFAULT_CATEGORIES,
  defaultAudienceId = "everyone",
  defaultCategoryId = "",
  isSubmitting = false,
  submitLabel = "Publish Post",
  className,
  onBack,
  onSubmit,
}: UBCreatePostProps) {
  const [title, setTitle] = React.useState("")
  const [body, setBody] = React.useState("")
  const [audienceId, setAudienceId] = React.useState(defaultAudienceId)
  const [categoryId, setCategoryId] = React.useState(defaultCategoryId)
  const [thumbnail, setThumbnail] = React.useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null)
  const [audienceOpen, setAudienceOpen] = React.useState(false)
  const [categoryOpen, setCategoryOpen] = React.useState(false)

  const bodyRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const selectedAudience =
    audiences.find((a) => a.id === audienceId) ?? audiences[0]
  const selectedCategory = categories.find((c) => c.id === categoryId)

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null

    if (!file) {
      return
    }

    setThumbnail(file)
    const url = URL.createObjectURL(file)

    setThumbnailPreview(url)
  }

  const clearThumbnail = () => {
    setThumbnail(null)

    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
    }

    setThumbnailPreview(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const execFormat = (command: string) => {
    const textarea = bodyRef.current

    if (!textarea) {
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = body.slice(start, end)

    let wrapped = selected

    if (command === "bold") {
      wrapped = `**${selected}**`
    } else if (command === "italic") {
      wrapped = `_${selected}_`
    } else if (command === "link") {
      wrapped = `[${selected || "link text"}](url)`
    } else if (command === "ul") {
      wrapped = selected
        .split("\n")
        .map((line) => `- ${line}`)
        .join("\n")
    } else if (command === "ol") {
      wrapped = selected
        .split("\n")
        .map((line, i) => `${i + 1}. ${line}`)
        .join("\n")
    }

    const next = body.slice(0, start) + wrapped + body.slice(end)

    setBody(next)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start, start + wrapped.length)
    }, 0)
  }

  const handleSubmit = () => {
    onSubmit?.({ title, body, audienceId, categoryId, thumbnail })
  }

  const canSubmit = title.trim().length > 0 && body.trim().length > 0

  return (
    <div className={cn("mx-auto w-full max-w-2xl space-y-4", className)}>
      {/* Back */}
      {onBack ? (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
      ) : null}

      {/* Audience selector */}
      <div className="relative">
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-card px-3.5 text-sm font-medium text-foreground hover:bg-muted"
          onClick={() => setAudienceOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={audienceOpen}
        >
          <span>{selectedAudience?.label ?? "Select audience"}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>

        {audienceOpen ? (
          <ul
            role="listbox"
            className="absolute left-0 top-full z-10 mt-1 min-w-[10rem] overflow-hidden rounded-2xl border border-border bg-popover py-1 shadow-lg"
          >
            {audiences.map((audience) => (
              <li key={audience.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={audience.id === audienceId}
                  className={cn(
                    "w-full px-3.5 py-2 text-left text-sm hover:bg-muted",
                    audience.id === audienceId && "font-semibold text-primary"
                  )}
                  onClick={() => {
                    setAudienceId(audience.id)
                    setAudienceOpen(false)
                  }}
                >
                  {audience.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Thumbnail uploader */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          id="post-thumbnail"
          onChange={handleThumbnailChange}
        />

        {thumbnailPreview ? (
          <div className="group relative h-44 w-full overflow-hidden rounded-2xl border border-border">
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label="Remove thumbnail"
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur hover:bg-background"
              onClick={clearThumbnail}
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="post-thumbnail"
            className="flex h-20 w-full cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-4 text-sm text-muted-foreground hover:bg-muted/50"
          >
            <Upload className="size-5" />
            <span>Add a thumbnail image</span>
          </label>
        )}
      </div>

      {/* Title */}
      <div className="relative rounded-2xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring/40">
        <input
          type="text"
          placeholder="Post Title*"
          maxLength={TITLE_MAX}
          value={title}
          className="w-full rounded-2xl bg-transparent px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          onChange={(e) => setTitle(e.target.value)}
        />
        <span
          className={cn(
            "pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs tabular-nums",
            title.length >= TITLE_MAX ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {TITLE_MAX - title.length}
        </span>
      </div>

      {/* Category */}
      <div className="relative">
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border bg-card px-3.5 text-sm text-muted-foreground hover:bg-muted"
          onClick={() => setCategoryOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={categoryOpen}
        >
          <Sparkles className="size-4" />
          <span>{selectedCategory?.label ?? "Select category"}</span>
          <ChevronDown className="size-4" />
        </button>

        {categoryOpen ? (
          <ul
            role="listbox"
            className="absolute left-0 top-full z-10 mt-1 min-w-[12rem] overflow-hidden rounded-2xl border border-border bg-popover py-1 shadow-lg"
          >
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={category.id === categoryId}
                  className={cn(
                    "w-full px-3.5 py-2 text-left text-sm hover:bg-muted",
                    category.id === categoryId && "font-semibold text-primary"
                  )}
                  onClick={() => {
                    setCategoryId(category.id)
                    setCategoryOpen(false)
                  }}
                >
                  {category.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Body editor */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring/40">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
          <ToolbarButton label="Insert image" onClick={() => fileInputRef.current?.click()}>
            <Image className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Insert link" onClick={() => execFormat("link")}>
            <Link2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Mention someone" onClick={() => setBody((b) => b + "@")}>
            <AtSign className="size-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-border" />

          <ToolbarButton label="Bold" onClick={() => execFormat("bold")}>
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Italic" onClick={() => execFormat("italic")}>
            <Italic className="size-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-border" />

          <ToolbarButton label="Bullet list" onClick={() => execFormat("ul")}>
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Numbered list" onClick={() => execFormat("ol")}>
            <ListOrdered className="size-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-border" />

          <ToolbarButton label="Undo">
            <Undo2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Redo">
            <Redo2 className="size-4" />
          </ToolbarButton>
        </div>

        {/* Body */}
        <textarea
          ref={bodyRef}
          placeholder="Share your thoughts…"
          maxLength={BODY_MAX}
          value={body}
          rows={8}
          className="w-full resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          onChange={(e) => setBody(e.target.value)}
        />

        <div className="flex justify-end px-3 pb-2">
          <span
            className={cn(
              "text-xs tabular-nums",
              body.length >= BODY_MAX ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {BODY_MAX - body.length}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end pt-1">
        <UBButton
          type="button"
          size="xl"
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Publishing…" : submitLabel}
        </UBButton>
      </div>
    </div>
  )
}
