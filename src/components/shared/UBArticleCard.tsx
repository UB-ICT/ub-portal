import { Bookmark, Clock, MessageCircle, Share2, ThumbsUp } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"
import { UBTag } from "./UBTag"

export type UBArticleCardProps = React.HTMLAttributes<HTMLDivElement> & {
  imageSrc: string
  imageAlt?: string
  category: string
  categoryVariant?: "neutral" | "primary" | "secondary" | "destructive" | "category"
  department: string
  postedAt: string
  title: string
  readTime: string
  author: string
  likes: number
  comments: number
  onBookmark?: () => void
  onShare?: () => void
  onLike?: () => void
  href?: string
}

export function UBArticleCard({
  imageSrc,
  imageAlt,
  category,
  categoryVariant = "category",
  department,
  postedAt,
  title,
  readTime,
  author,
  likes,
  comments,
  onBookmark,
  onShare,
  onLike,
  href,
  className,
  ...props
}: UBArticleCardProps) {
  const titleContent = href ? (
    <a href={href} className="hover:underline underline-offset-2">
      {title}
    </a>
  ) : (
    title
  )

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm",
        className
      )}
      {...props}
    >
      {/* Image + category tag */}
      <div className="relative">
        <img
          src={imageSrc}
          alt={imageAlt ?? title}
          className="h-48 w-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <UBTag text={category} variant={categoryVariant} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Department + time */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium text-foreground">{department}</span>
          <span className="text-xs text-muted-foreground">{postedAt}</span>
        </div>

        {/* Title */}
        <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight text-foreground">
          {titleContent}
        </h3>

        {/* Read time + author */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5 shrink-0" />
          <span>{readTime}</span>
          <span className="text-border">|</span>
          <span>by {author}</span>
        </div>

        <div className="mt-4 border-t" />

        {/* Engagement row */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLike}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              aria-label={`${likes} likes`}
            >
              <ThumbsUp className="size-3.5" />
              <span>{likes}</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              aria-label={`${comments} comments`}
            >
              <MessageCircle className="size-3.5" />
              <span>{comments}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBookmark}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Bookmark article"
            >
              <Bookmark className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={onShare}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Share article"
            >
              <Share2 className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
