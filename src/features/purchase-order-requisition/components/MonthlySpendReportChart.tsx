import React from "react"
import ReactEChartsCore from "echarts-for-react/lib/core"
import type { EChartsOption } from "echarts"
import { Info } from "lucide-react"

import { echarts } from "../lib/echarts-setup"
import { useChartTheme } from "../lib/use-chart-theme"

export type MonthlySpendPoint = {
  month: string // e.g. "2026-07"
  spent: number
}

export type MonthlySpendReportChartProps = {
  data?: MonthlySpendPoint[]
  isLoading?: boolean
  error?: string | null
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BZD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatMonthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number)
  return new Date(year, (monthIndex ?? 1) - 1, 1).toLocaleDateString("en-US", {
    month: "short",
  })
}

export const MonthlySpendReportChart: React.FC<
  MonthlySpendReportChartProps
> = ({ data = [], isLoading = false, error = null }) => {
  const theme = useChartTheme()

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        Loading spend report...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        Error loading spend report: {error}
      </div>
    )
  }

  const option: EChartsOption = {
    color: [theme.accent],
    grid: { left: 56, right: 20, top: 24, bottom: 32 },
    tooltip: {
      trigger: "item",
      valueFormatter: (value) => formatCurrency(Number(value)),
    },
    xAxis: {
      type: "category",
      data: data.map((point) => point.month),
      axisLabel: { color: theme.ink, formatter: formatMonthLabel },
      axisLine: { lineStyle: { color: theme.gridline } },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: theme.ink,
        formatter: (value: number) => formatCurrency(value),
      },
      splitLine: { lineStyle: { color: theme.gridline } },
    },
    series: [
      {
        name: "Spent",
        type: "bar",
        data: data.map((point) => point.spent),
        barMaxWidth: 24,
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="pb-4">
        <h2 className="inline-flex items-center gap-1.5 text-lg font-semibold text-foreground">
          Monthly Spend
          <span
            className="cursor-help text-muted-foreground/70"
            title="Total approved/closed requisition spend for your cost center(s), grouped by month."
          >
            <Info className="size-3.5" />
          </span>
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Total requisition spend per month
        </p>
      </div>

      {data.length > 0 ? (
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          style={{ height: 280, width: "100%" }}
          notMerge
        />
      ) : (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No spend history available yet.
        </div>
      )}
    </div>
  )
}
