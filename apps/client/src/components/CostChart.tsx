import ReactECharts from "echarts-for-react";
import type { TransitionPlanResult } from "../domain/fleet";

export function CostChart({ result }: { result: TransitionPlanResult }) {
  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "#0f172a",
      borderColor: "rgba(56, 189, 248, 0.35)",
      textStyle: { color: "#f8fafc" },
    },
    legend: {
      type: "scroll",
      top: 0,
      left: "center",
      textStyle: { color: "#94a3b8" },
    },
    grid: { top: 54, right: 16, bottom: 30, left: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: result.years.map((item) => item.year),
      axisLine: { lineStyle: { color: "#334155" } },
      axisLabel: { color: "#94a3b8" },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "rgba(51,65,85,0.42)" } },
      axisLabel: {
        color: "#94a3b8",
        formatter: (value: number) => `$${Math.round(value / 1000)}k`,
      },
    },
    series: [
      {
        name: "Annual total cost",
        type: "line",
        smooth: true,
        lineStyle: { width: 3, color: "#38bdf8" },
        itemStyle: { color: "#38bdf8" },
        areaStyle: { color: "rgba(56,189,248,0.08)" },
        data: result.years.map((item) => Math.round(item.annualTotalCost)),
      },
      {
        name: "Annual energy cost",
        type: "line",
        smooth: true,
        lineStyle: { width: 2, color: "#10b981" },
        itemStyle: { color: "#10b981" },
        data: result.years.map((item) => Math.round(item.annualEnergyCost)),
      },
    ],
  };

  return (
    <section className="min-w-0 rounded-2xl border border-slate-700/70 bg-slate-800/55 p-3 shadow-[0_14px_36px_rgba(0,0,0,0.2)] backdrop-blur-lg sm:p-4">
      <h2 className="mb-2 break-words text-xs font-bold uppercase tracking-[0.12em] text-slate-300">Cost over time</h2>
      <div className="min-w-0">
        <ReactECharts option={option} style={{ width: "100%", height: "clamp(16rem, 42vw, 22rem)" }} />
      </div>
    </section>
  );
}
