import type * as React from "react"

import { cn } from "@/lib/utils"

export type UBMenuItem = {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  active?: boolean
}

export type UBMenuProps = React.HTMLAttributes<HTMLElement> & {
  items: UBMenuItem[]
  brandTitle: string
  brandDescription: string
  privacyHref?: string
  termsHref?: string
  copyrightText?: string
}

export function UBMenu({
  items,
  brandTitle,
  brandDescription,
  privacyHref = "#",
  termsHref = "#",
  copyrightText = `© ${new Date().getFullYear()} UB Portal. All rights reserved.`,
  className,
  ...props
}: UBMenuProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-full max-w-72 flex-col rounded-2xl border border-primary/40 bg-primary p-4 text-primary-foreground",
        className
      )}
      {...props}
    >
      <nav aria-label="Main menu" className="space-y-2">
        {items.map((item) => {
          const itemClassName = cn(
            "inline-flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors",
            item.active
              ? "border-primary-foreground/40 bg-primary-foreground/15 text-primary-foreground"
              : "border-transparent text-primary-foreground hover:border-primary-foreground/25 hover:bg-primary-foreground/10"
          )

          if (item.href) {
            return (
              <a key={item.id} href={item.href} className={itemClassName}>
                <span className="inline-flex size-4 items-center justify-center">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            )
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={itemClassName}
            >
              <span className="inline-flex size-4 items-center justify-center">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-4 border-t border-primary-foreground/15 pt-4">
        <div className="rounded-xl bg-linear-to-tr from-amber-500 via-yellow-400 to-amber-300 p-4 text-amber-950">
          <p className="text-sm font-semibold tracking-tight">{brandTitle}</p>
          <p className="mt-1 text-xs text-amber-950/80">{brandDescription}</p>
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-primary-foreground/80">
          <p>{copyrightText}</p>
          <div className="flex items-center gap-2">
            <a href={privacyHref} className="underline-offset-2 hover:text-primary-foreground hover:underline">
              Privacy Policy
            </a>
            <span>•</span>
            <a href={termsHref} className="underline-offset-2 hover:text-primary-foreground hover:underline">
              Terms
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
