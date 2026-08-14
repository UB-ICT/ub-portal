import { useEffect, useState } from "react"

const CATEGORICAL_VARS = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--chart-6",
  "--chart-7",
  "--chart-8",
] as const

export type ChartTheme = {
  // Fixed-order categorical palette (see index.css) — assign in sequence,
  // never cycled, for charts with two or more series.
  categorical: string[]
  // Single-series/emphasis hue (chart-7 — closest documented family to
  // --primary) for charts with only one series.
  accent: string
  ink: string
  gridline: string
}

function readChartTheme(): ChartTheme {
  const styles = getComputedStyle(document.documentElement)
  const read = (name: string) => styles.getPropertyValue(name).trim()

  return {
    categorical: CATEGORICAL_VARS.map(read),
    accent: read("--chart-7"),
    ink: read("--muted-foreground"),
    gridline: read("--border"),
  }
}

export function useChartTheme(): ChartTheme {
  const [theme, setTheme] = useState<ChartTheme>(() =>
    typeof document === "undefined"
      ? { categorical: [], accent: "", ink: "", gridline: "" }
      : readChartTheme()
  )

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => setTheme(readChartTheme()))
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return theme
}
