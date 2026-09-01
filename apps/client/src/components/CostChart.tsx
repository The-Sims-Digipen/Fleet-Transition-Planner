import ReactECharts from "echarts-for-react";
import type { TransitionPlanResult } from "../domain/fleet";

export function CostChart({
  result,
}: {
  result: TransitionPlanResult;
}) {
  const option = {
    tooltip: {
      trigger: "axis",
      confine: true,
    },
    legend: {
      type: "scroll",
      top: 0,
      left: "center",
      textStyle: { color: "#d4d4d8" },
    },
    grid: {
      top: 54,
      right: 16,
      bottom: 30,
      left: 8,
      containLabel: true,
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
    <section className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4">
      <h2 className="mb-2 break-words text-sm font-semibold uppercase tracking-wide text-zinc-300">
        Cost over time
      </h2>
      <div className="min-w-0">
        <ReactECharts
          option={option}
          style={{
            width: "100%",
            height: "clamp(16rem, 42vw, 22rem)",
          }}
        />
      </div>
    </section>
  );
}
