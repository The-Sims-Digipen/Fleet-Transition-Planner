import ReactECharts from "echarts-for-react";
import type { PaybackProjectionPoint, TransitionPlanResult } from "../domain/fleet";
import { compactMoney, money } from "../utils/format";

type CashSeriesPoint = {
  value: [number, number];
  year: number;
  phase: "after-capital" | "year-end";
  baselineFuelThisYear: number;
  planDieselThisYear: number;
  planElectricityThisYear: number;
  capitalThisYear: number;
  cumulativeBaselineCost: number;
  cumulativePlanCost: number;
};

const durationFormat = new Intl.NumberFormat("en-SG", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatDuration(years: number): string {
  return `${durationFormat.format(years)} ${Math.abs(years - 1) < 0.05 ? "year" : "years"}`;
}

function positionLabel(value: number): string {
  return value >= 0
    ? `${money.format(value)} net savings`
    : `${money.format(Math.abs(value))} left to recover`;
}

function toCashSeries(points: PaybackProjectionPoint[]): CashSeriesPoint[] {
  return points.flatMap((point, index) => {
    const afterCapital: CashSeriesPoint = {
      value: [point.elapsedYears - 1, Math.round(point.netPositionBeforeOperations)],
      year: point.year,
      phase: "after-capital",
      baselineFuelThisYear: point.annualBaselineFuelCost,
      planDieselThisYear: point.annualPlanDieselCost,
      planElectricityThisYear: point.annualPlanElectricCost,
      capitalThisYear: point.annualCapitalCost,
      cumulativeBaselineCost:
        point.cumulativeBaselineCost - point.annualBaselineFuelCost,
      cumulativePlanCost:
        point.cumulativePlanCost - point.annualPlanOperatingCost,
    };
    const yearEnd: CashSeriesPoint = {
      value: [point.elapsedYears, Math.round(point.netPosition)],
      year: point.year,
      phase: "year-end",
      baselineFuelThisYear: point.annualBaselineFuelCost,
      planDieselThisYear: point.annualPlanDieselCost,
      planElectricityThisYear: point.annualPlanElectricCost,
      capitalThisYear: point.annualCapitalCost,
      cumulativeBaselineCost: point.cumulativeBaselineCost,
      cumulativePlanCost: point.cumulativePlanCost,
    };

    return index === 0 || point.annualCapitalCost > 0
      ? [afterCapital, yearEnd]
      : [yearEnd];
  });
}

export function CostChart({ result, selectedYear }: {
  result: TransitionPlanResult;
  selectedYear: number;
}) {
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const projection = result.payback;
  const finalPoint = projection.points.at(-1);
  const cashSeries = toCashSeries(projection.points);
  const hasTransitionInvestment = projection.firstTransitionYear !== null;
  const paybackCalendarYear = projection.paybackCalendarYear === null
    ? null
    : Math.floor(projection.paybackCalendarYear);
  const selectedElapsed = projection.firstTransitionYear === null
    ? null
    : selectedYear - projection.firstTransitionYear + 1;
  const showSelectedYear =
    selectedElapsed !== null &&
    selectedElapsed >= 0 &&
    selectedElapsed <= (finalPoint?.elapsedYears ?? 0);

  const outcome = !hasTransitionInvestment
    ? {
        tone: "neutral",
        title: "No transition investment",
        detail: "Assign a transition year to see how long the investment takes to recover.",
      }
    : projection.paybackYears !== null && paybackCalendarYear !== null
      ? {
          tone: "positive",
          title: `Pays back in ${formatDuration(projection.paybackYears)}`,
          detail: `${money.format(projection.totalCapitalCost)} of capital is fully recovered during ${paybackCalendarYear}.`,
        }
      : {
          tone: "warning",
          title: `No payback within ${finalPoint?.elapsedYears ?? projection.projectionLimitYears} years`,
          detail: `${money.format(Math.max(0, -(finalPoint?.netPosition ?? 0)))} remains unrecovered by ${finalPoint?.year}.`,
        };

  const positions = cashSeries.map((point) => point.value[1]);
  const rawMin = Math.min(0, ...positions);
  const rawMax = Math.max(0, ...positions);
  const spread = Math.max(1_000, rawMax - rawMin);
  const axisMin = Math.floor(rawMin - spread * 0.12);
  const axisMax = Math.ceil(rawMax + spread * 0.12);
  const xMax = (finalPoint?.elapsedYears ?? 1) +
    (projection.paybackYears === null ? 0 : 1);
  const xInterval = xMax <= 10 ? 1 : 2;

  const markLines: Array<Record<string, unknown>> = [
    {
      name: "Payback threshold",
      yAxis: 0,
      lineStyle: { color: "rgba(226, 232, 240, 0.72)", type: "dashed", width: 2 },
      label: {
        show: true,
        position: "insideStartTop",
        formatter: "Investment fully recovered · $0",
        color: "#e2e8f0",
        backgroundColor: "rgba(12, 20, 36, 0.9)",
        borderRadius: 4,
        padding: [3, 6],
      },
    },
  ];

  if (showSelectedYear) {
    markLines.push({
      name: `Selected ${selectedYear}`,
      xAxis: selectedElapsed,
      lineStyle: { color: "rgba(56, 189, 248, 0.72)", type: "dotted", width: 2 },
      label: {
        show: true,
        position: "insideEndTop",
        align: selectedElapsed < xMax / 2 ? "left" : "right",
        rotate: 0,
        distance: 6,
        formatter: `Selected ${selectedYear}`,
        color: "#bae6fd",
        backgroundColor: "rgba(12, 20, 36, 0.9)",
        borderRadius: 4,
        padding: [3, 6],
      },
    });
  }

  const option = {
    animation: !reduceMotion,
    backgroundColor: "transparent",
    aria: {
      enabled: true,
      decal: { show: true },
      description: `${outcome.title}. ${outcome.detail}`,
    },
    tooltip: {
      trigger: "item",
      confine: true,
      backgroundColor: "#0f172a",
      borderColor: "rgba(56, 189, 248, 0.35)",
      textStyle: { color: "#f8fafc" },
      formatter: (params: { data?: CashSeriesPoint }) => {
        const point = params.data;
        if (!point) return "";
        const isYearEnd = point.phase === "year-end";
        return [
          `<strong>${point.year} · ${isYearEnd ? "End of year" : "After scheduled purchases"}</strong>`,
          `Years since first transition: ${durationFormat.format(point.value[0])}`,
          `Before · all-diesel fuel this year: ${money.format(point.baselineFuelThisYear)}`,
          `After · remaining diesel this year: ${money.format(point.planDieselThisYear)}`,
          `After · EV electricity this year: ${money.format(point.planElectricityThisYear)}`,
          `After · EV and charger purchases: ${money.format(point.capitalThisYear)}`,
          `Before · cumulative all-diesel cost: ${money.format(point.cumulativeBaselineCost)}`,
          `After · cumulative plan cost: ${money.format(point.cumulativePlanCost)}`,
          `Total-cost difference: ${positionLabel(point.value[1])}`,
        ].join("<br/>");
      },
    },
    legend: {
      data: ["Before cost − after cost"],
      top: 0,
      left: "center",
      textStyle: { color: "#cbd5e1" },
    },
    grid: { top: 46, right: 20, bottom: 48, left: 8, containLabel: true },
    xAxis: {
      type: "value",
      min: 0,
      max: xMax,
      interval: xInterval,
      name: "Years since first EV transition",
      nameLocation: "middle",
      nameGap: 32,
      nameTextStyle: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "#475569" } },
      splitLine: { show: false },
      axisLabel: { color: "#cbd5e1" },
    },
    yAxis: {
      type: "value",
      min: axisMin,
      max: axisMax,
      splitNumber: 5,
      splitLine: { lineStyle: { color: "rgba(71,85,105,0.35)" } },
      axisLabel: {
        color: "#cbd5e1",
        formatter: (value: number) => compactMoney.format(value),
      },
    },
    series: [
      {
        name: "Before cost − after cost",
        type: "line",
        z: 3,
        showSymbol: true,
        symbol: "circle",
        symbolSize: 6,
        smooth: false,
        lineStyle: { width: 3, color: "#38bdf8" },
        itemStyle: { color: "#38bdf8", borderColor: "#0c1424", borderWidth: 1.5 },
        areaStyle: { color: "rgba(56, 189, 248, 0.08)" },
        data: cashSeries,
        markArea: {
          silent: true,
          label: { show: false },
          data: [
            [
              { yAxis: axisMin, itemStyle: { color: "rgba(248, 113, 113, 0.08)" } },
              { yAxis: 0 },
            ],
            [
              { yAxis: 0, itemStyle: { color: "rgba(52, 211, 153, 0.07)" } },
              { yAxis: axisMax },
            ],
          ],
        },
        markLine: {
          silent: true,
          symbol: ["none", "none"],
          data: markLines,
        },
        markPoint: {
          symbol: "circle",
          symbolSize: 18,
          itemStyle: { color: "#34d399", borderColor: "#d1fae5", borderWidth: 2 },
          label: {
            show: projection.paybackYears !== null,
            position: "top",
            formatter: projection.paybackYears === null
              ? ""
              : `Paid back\n${durationFormat.format(projection.paybackYears)} yrs`,
            color: "#d1fae5",
            fontWeight: 700,
          },
          data: projection.paybackYears === null
            ? []
            : [{ coord: [projection.paybackYears, 0] }],
        },
      },
    ],
  };

  return (
    <section className="panel-card" aria-labelledby="cost-chart-title">
      <div className="section-heading-row compact-heading">
        <div>
          <p className="eyebrow">All-diesel baseline against the active plan</p>
          <h2 id="cost-chart-title" className="section-title">Total-cost payback</h2>
        </div>
      </div>
      <div className={`cost-chart-insight tone-${outcome.tone}`} role="status">
        <strong>{outcome.title}</strong>
        <span>{outcome.detail}</span>
      </div>
      <p className="sr-only">
        This chart subtracts the active plan&apos;s cumulative total cost from the cumulative cost of retaining an all-diesel fleet. The active plan includes EV and charger purchases, diesel for vehicles not yet transitioned, and electricity for EVs. Values below zero are unrecovered cost; crossing zero is full-plan payback; values above zero are net savings. {outcome.title}. {outcome.detail}
      </p>
      {hasTransitionInvestment ? (
        <>
          <div className="payback-zone-key" aria-label="Chart position guide">
            <span><i className="zone-unrecovered" aria-hidden="true" />Below $0 · investment not yet recovered</span>
            <span><i className="zone-savings" aria-hidden="true" />Above $0 · net savings</span>
          </div>
          <p className="chart-unit-label">Cumulative total-cost difference (SGD)</p>
          <ReactECharts option={option} style={{ width: "100%", height: "20rem" }} />
          <details className="data-table-disclosure payback-data-table">
            <summary>View payback data</summary>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Calendar year</th>
                    <th>Years since first transition</th>
                    <th>Before · cumulative all-diesel</th>
                    <th>After · cumulative active plan</th>
                    <th>Plan capital this year</th>
                    <th>Plan diesel this year</th>
                    <th>Plan electricity this year</th>
                    <th>Total-cost difference</th>
                  </tr>
                </thead>
                <tbody>
                  {projection.points.map((point) => (
                    <tr key={point.year} className={point.year === selectedYear ? "is-selected" : undefined}>
                      <th scope="row">{point.year}</th>
                      <td>{durationFormat.format(point.elapsedYears)}</td>
                      <td>{money.format(point.cumulativeBaselineCost)}</td>
                      <td>{money.format(point.cumulativePlanCost)}</td>
                      <td>{money.format(point.annualCapitalCost)}</td>
                      <td>{money.format(point.annualPlanDieselCost)}</td>
                      <td>{money.format(point.annualPlanElectricCost)}</td>
                      <td>{positionLabel(point.netPosition)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <div className="payback-chart-empty" role="img" aria-label="No payback chart is available because the active plan has no scheduled transition investment.">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d="M4 19V5M4 19h16M7 15l4-4 3 2 5-6" />
          </svg>
          <span>Schedule at least one vehicle transition to calculate payback.</span>
        </div>
      )}
    </section>
  );
}
