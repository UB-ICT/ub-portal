import type { ReactNode } from "react"
import { ShieldCheck, Sparkles } from "lucide-react"

type AuthLayoutProps = {
  title: string
  description: string
  children: ReactNode
}

const loginHighlights = [
  "Single sign-on with your UB Google account",
  "Server-issued session token handled through TanStack Query",
  "Ready for route-based expansion across the portal",
]

export function AuthLayout({
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-svh bg-muted/30">
      <div className="mx-auto grid min-h-svh max-w-7xl gap-10 px-6 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
        <section className="flex flex-col justify-between rounded-[2rem] bg-gradient-to-br from-primary via-primary to-primary/80 p-8 text-primary-foreground shadow-sm lg:p-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
              <ShieldCheck className="size-4" />
              University of Belize
            </div>
            <div className="max-w-xl space-y-4">
              <p className="text-sm uppercase tracking-[0.25em] text-primary-foreground/70">
                UB Portal
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-balance lg:text-5xl">
                {title}
              </h1>
              <p className="max-w-lg text-base leading-7 text-primary-foreground/80 lg:text-lg">
                {description}
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl bg-white/10 p-6 backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4" />
              Portal foundation
            </div>
            <ul className="space-y-3 text-sm leading-6 text-primary-foreground/80">
              {loginHighlights.map((highlight) => (
                <li
                  key={highlight}
                  className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-[2rem] border bg-card p-8 shadow-sm lg:p-10">
            {children}
          </div>
        </section>
      </div>
    </div>
  )
}
