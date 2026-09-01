import ReactECharts from "echarts-for-react";
import type { ComparisonMetric, TransitionPlanResult } from "../domain/fleet";
import { compactMoney, money, wholeNumber } from "../utils/format";

export function ComparisonChart({ metric, resultA, resultB, capacity }: {
  metric: ComparisonMetric;
  resultA: TransitionPlanResult;
  resultB: TransitionPlanResult;
  capacity: number;
}) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const years = resultA.years.map((item) => item.year);
  const values = (result: TransitionPlanResult) => result.years.map((item) => {
    if (metric === "cost") return item.cumulativeCost;
    if (metric === "emissions") return item.cumulativeEmissionsKgCO2 / 1000;
    return item.peakPowerKW;
  });
  const valueFormatter = (value: number) => {
    if (metric === "cost") return money.format(value);
    if (metric === "emissions") return `${wholeNumber.format(value)} t CO₂`;
    return `${wholeNumber.format(value)} kW`;
  };
  const axisFormatter = (value: number) => metric === "cost"
    ? compactMoney.format(value)
    : metric === "emissions"
      ? `${wholeNumber.format(value)} t`
      : `${wholeNumber.format(value)} kW`;
  const series = [
    {
      name: "Plan A",
      type: "line",
      smooth: true,
      symbol: "circle",
      symbolSize: 8,
      lineStyle: { width: 3, color: "#38bdf8" },
      itemStyle: { color: "#38bdf8" },
      data: values(resultA),
    },
    {
      name: "Plan B",
      type: "line",
      smooth: true,
      symbol: "diamond",
      symbolSize: 9,
      lineStyle: { width: 3, color: "#10b981", type: "dashed" },
      itemStyle: { color: "#10b981" },
      data: values(resultB),
    },
  ];
  if (metric === "power") {
    series.push({
      name: "Site capacity",
      type: "line",
      smooth: false,
      symbol: "none",
      symbolSize: 0,
      lineStyle: { width: 2, color: "#f59e0b", type: "dashed" },
      itemStyle: { color: "#f59e0b" },
      data: years.map(() => capacity),
    });
  }

  const option = {
    animation: !reduceMotion,
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "#0f172a",
      borderColor: "rgba(56,189,248,.35)",
      textStyle: { color: "#f8fafc" },
      valueFormatter,
    },
    legend: { top: 0, textStyle: { color: "#cbd5e1" } },
    grid: { top: 50, right: 18, bottom: 28, left: 8, containLabel: true },
    xAxis: { type: "category", data: years, axisLabel: { color: "#cbd5e1" }, axisLine: { lineStyle: { color: "#475569" } } },
    yAxis: { type: "value", axisLabel: { color: "#cbd5e1", formatter: axisFormatter }, splitLine: { lineStyle: { color: "rgba(71,85,105,.35)" } } },
    series,
  };

  return (
    <div>
      <p className="sr-only">Comparison chart for {metric}, showing Plan A and Plan B from {years[0]} to {years.at(-1)}.</p>
      <ReactECharts option={option} style={{ width: "100%", height: "19rem" }} />
      <details className="data-table-disclosure">
        <summary>View comparison data</summary>
        <div className="table-scroll"><table><thead><tr><th>Year</th><th>Plan A</th><th>Plan B</th>{metric === "power" && <th>Capacity</th>}</tr></thead><tbody>{years.map((year, index) => <tr key={year}><th scope="row">{year}</th><td>{valueFormatter(values(resultA)[index])}</td><td>{valueFormatter(values(resultB)[index])}</td>{metric === "power" && <td>{valueFormatter(capacity)}</td>}</tr>)}</tbody></table></div>
      </details>
    </div>
  );
}
