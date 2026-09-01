import ReactECharts from "echarts-for-react";
import type { TransitionPlanResult } from "@fleet/core";

export function CostChart({
  result,
}: {
  result: TransitionPlanResult;
}) {
  const option = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      textStyle: { color: "#d4d4d8" },
    },
    xAxis: {
      type: "category",
      data: result.years.map((item) => item.year),
      axisLabel: { color: "#a1a1aa" },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#a1a1aa",
        formatter: (value: number) => `$${Math.round(value / 1000)}k`,
      },
    },
    series: [
      {
        name: "Annual total cost",
        type: "line",
        smooth: true,
        data: result.years.map((item) => Math.round(item.annualTotalCost)),
      },
      {
        name: "Annual energy cost",
        type: "line",
        smooth: true,
        data: result.years.map((item) => Math.round(item.annualEnergyCost)),
      },
    ],
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-300">
        Cost over time
      </h2>
      <ReactECharts option={option} style={{ height: 300 }} />
    </div>
  );
}
