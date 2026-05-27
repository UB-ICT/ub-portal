type StatusScreenProps = {
  title: string
  description: string
}

export function StatusScreen({ title, description }: StatusScreenProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border bg-card p-10 text-center shadow-sm">
        <div className="size-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
