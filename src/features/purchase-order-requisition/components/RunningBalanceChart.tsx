import React from "react"
import ReactEChartsCore from "echarts-for-react/lib/core"
import type { EChartsOption } from "echarts"
import { Info } from "lucide-react"

import type { BalanceOverTimePoint } from "@/lib/api/dashboard"

import { echarts } from "../lib/echarts-setup"
import { useChartTheme } from "../lib/use-chart-theme"

export type { BalanceOverTimePoint }

export type RunningBalanceChartProps = {
  data?: BalanceOverTimePoint[]
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

function formatAxisDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  })
}

export const RunningBalanceChart: React.FC<RunningBalanceChartProps> = ({
  data = [],
  isLoading = false,
  error = null,
}) => {
  const theme = useChartTheme()

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        Loading running balance...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        Error loading running balance: {error}
      </div>
    )
  }

  const costCenterIds = Array.from(
    new Set(data.map((point) => point.cost_center_id))
  )
  const isMultiCostCenter = costCenterIds.length > 1
  const dates = Array.from(new Set(data.map((point) => point.date))).sort()

  let option: EChartsOption

  if (!isMultiCostCenter && dates.length > 0) {
    const singleCenterData = data.filter(
      (point) => point.cost_center_id === costCenterIds[0]
    )
    const spentByDate = new Map(
      singleCenterData.map((point) => [point.date, point.spent_cumulative])
    )
    const allocated = singleCenterData[0]?.allocated ?? 0

    option = {
      color: [theme.accent, theme.gridline],
      grid: { left: 56, right: 20, top: 48, bottom: 32 },
      legend: {
        data: ["Spent", "Allocated"],
        top: 0,
        left: 0,
        textStyle: { color: theme.ink, fontSize: 12 },
        itemWidth: 14,
        itemHeight: 8,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
        valueFormatter: (value) => formatCurrency(Number(value)),
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: { color: theme.ink, formatter: formatAxisDate },
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
          type: "line",
          data: dates.map((date) => spentByDate.get(date) ?? null),
          lineStyle: { width: 2 },
          symbolSize: 8,
          areaStyle: { opacity: 0.1 },
        },
        {
          name: "Allocated",
          type: "line",
          data: dates.map(() => allocated),
          lineStyle: { width: 2, type: "dashed" },
          symbol: "none",
        },
      ],
    }
  } else {
    const centerNameById = new Map(
      data.map((point) => [
        point.cost_center_id,
        point.cost_center_name ?? `Cost Center ${point.cost_center_id}`,
      ])
    )

    option = {
      color: theme.categorical,
      grid: { left: 56, right: 20, top: 48, bottom: 32 },
      legend: {
        data: costCenterIds.map((id) => centerNameById.get(id) ?? ""),
        top: 0,
        left: 0,
        textStyle: { color: theme.ink, fontSize: 12 },
        itemWidth: 14,
        itemHeight: 8,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
        valueFormatter: (value) => formatCurrency(Number(value)),
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: { color: theme.ink, formatter: formatAxisDate },
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
      series: costCenterIds.map((id) => {
        const byDate = new Map(
          data
            .filter((point) => point.cost_center_id === id)
            .map((point) => [point.date, point.balance])
        )

        return {
          name: centerNameById.get(id),
          type: "line" as const,
          data: dates.map((date) => byDate.get(date) ?? null),
          lineStyle: { width: 2 },
          symbolSize: 8,
          markLine:
            id === costCenterIds[0]
              ? {
                  symbol: "none",
                  silent: true,
                  lineStyle: { color: theme.gridline, type: "dashed" },
                  label: { formatter: "Budget exhausted", color: theme.ink },
                  data: [{ yAxis: 0 }],
                }
              : undefined,
        }
      }),
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="pb-4">
        <h2 className="inline-flex items-center gap-1.5 text-lg font-semibold text-foreground">
          Running Balance
          <span
            className="cursor-help text-muted-foreground/70"
            title={
              isMultiCostCenter
                ? "Shows each of your cost centers' remaining balance (allocated budget minus approved/closed spend) over time. The dashed line at zero marks where a budget would be exhausted."
                : "Shows your cumulative approved/closed spend (solid line) against your allocated budget (dashed line). The gap between the two lines is your remaining balance."
            }
          >
            <Info className="size-3.5" />
          </span>
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {isMultiCostCenter
            ? "Remaining balance over time, by cost center"
            : "Cumulative spend against your allocated budget"}
        </p>
      </div>

      {dates.length > 0 ? (
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          style={{ height: 320, width: "100%" }}
          notMerge
        />
      ) : (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No balance history available for your cost centers.
        </div>
      )}
    </div>
  )
}
