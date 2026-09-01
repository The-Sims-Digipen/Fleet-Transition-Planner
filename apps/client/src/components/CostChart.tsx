import ReactECharts from "echarts-for-react";
import type { TransitionPlanResult } from "../domain/fleet";
import { compactMoney, money } from "../utils/format";

export function CostChart({ result, selectedYear }: {
  result: TransitionPlanResult;
  selectedYear: number;
}) {
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const option = {
    animation: !reduceMotion,
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "#0f172a",
      borderColor: "rgba(56, 189, 248, 0.35)",
      textStyle: { color: "#f8fafc" },
      valueFormatter: (value: number) => money.format(value),
    },
    legend: {
      type: "scroll",
      top: 0,
      left: "center",
      textStyle: { color: "#cbd5e1" },
    },
    grid: { top: 54, right: 16, bottom: 30, left: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: result.years.map((item) => item.year),
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: {
        color: (value: string) => Number(value) === selectedYear ? "#38bdf8" : "#cbd5e1",
        fontWeight: (value: string) => Number(value) === selectedYear ? 700 : 500,
      },
    },
    yAxis: {
      type: "value",
      name: "SGD per year",
      nameTextStyle: { color: "#94a3b8", align: "left" },
      splitLine: { lineStyle: { color: "rgba(71,85,105,0.35)" } },
      axisLabel: {
        color: "#cbd5e1",
        formatter: (value: number) => compactMoney.format(value),
      },
    },
    series: [
      {
        name: "Diesel operating cost",
        type: "bar",
        stack: "operating",
        itemStyle: { color: "#64748b", borderRadius: [3, 3, 0, 0] },
        data: result.years.map((item) => Math.round(item.annualDieselEnergyCost)),
      },
      {
        name: "EV operating cost",
        type: "bar",
        stack: "operating",
        itemStyle: { color: "#10b981", borderRadius: [3, 3, 0, 0] },
        data: result.years.map((item) => Math.round(item.annualElectricEnergyCost)),
      },
      {
        name: "All-diesel baseline",
        type: "line",
        symbol: "diamond",
        symbolSize: 7,
        lineStyle: { width: 2, color: "#f59e0b", type: "dashed" },
        itemStyle: { color: "#f59e0b" },
        data: result.years.map((item) => Math.round(item.dieselBaselineAnnualCost)),
      },
    ],
  };

  return (
    <section className="panel-card" aria-labelledby="cost-chart-title">
      <div className="section-heading-row compact-heading">
        <div>
          <p className="eyebrow">Operating cost against baseline</p>
          <h2 id="cost-chart-title" className="section-title">Annual cost projection</h2>
        </div>
      </div>
      <p className="sr-only">
        The chart compares diesel and electric operating costs with the all-diesel baseline from {result.years[0]?.year} to {result.years.at(-1)?.year}.
      </p>
      <ReactECharts option={option} style={{ width: "100%", height: "18rem" }} />
      <details className="data-table-disclosure">
        <summary>View chart data</summary>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Year</th><th>Diesel</th><th>Electric</th><th>Baseline</th></tr></thead>
            <tbody>
              {result.years.map((item) => (
                <tr key={item.year}>
                  <th scope="row">{item.year}</th>
                  <td>{money.format(item.annualDieselEnergyCost)}</td>
                  <td>{money.format(item.annualElectricEnergyCost)}</td>
                  <td>{money.format(item.dieselBaselineAnnualCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
