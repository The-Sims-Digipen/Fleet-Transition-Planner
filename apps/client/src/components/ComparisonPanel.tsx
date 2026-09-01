import { lazy, Suspense, useMemo, useState } from "react";
import { calculateTransitionPlan, summarizePlan } from "../domain/fleet";
import type { ComparisonMetric, PlanSummary } from "../domain/fleet";
import { usePlannerStore } from "../store/plannerStore";
import { compactMoney, formatTonnes, money, wholeNumber } from "../utils/format";

const LazyComparisonChart = lazy(() => import("./ComparisonChart").then((module) => ({ default: module.ComparisonChart })));

export function ComparisonPanel() {
  const workspace = usePlannerStore((state) => state.workspace);
  const activePlanId = usePlannerStore((state) => state.activePlanId);
  const setActivePlanId = usePlannerStore((state) => state.setActivePlanId);
  const [metric, setMetric] = useState<ComparisonMetric>("cost");
  const resultA = useMemo(() => calculateTransitionPlan(workspace.plans.planA, workspace.assumptions), [workspace.plans.planA, workspace.assumptions]);
  const resultB = useMemo(() => calculateTransitionPlan(workspace.plans.planB, workspace.assumptions), [workspace.plans.planB, workspace.assumptions]);
  const summaryA = summarizePlan(workspace.plans.planA, resultA);
  const summaryB = summarizePlan(workspace.plans.planB, resultB);

  return (
    <div className="workspace-stack">
      <div className="workspace-intro">
        <div>
          <p className="eyebrow">Like-for-like assumptions</p>
          <h2>Transition strategy comparison</h2>
          <p>Compare cost, payback, emissions, and depot capacity across two independent schedules.</p>
        </div>
        <div className="plan-preview-actions" role="group" aria-label="Plan shown in the depot">
          <button type="button" className={activePlanId === "planA" ? "secondary-button is-active" : "secondary-button"} onClick={() => setActivePlanId("planA")}>View Plan A in depot</button>
          <button type="button" className={activePlanId === "planB" ? "secondary-button is-active" : "secondary-button"} onClick={() => setActivePlanId("planB")}>View Plan B in depot</button>
        </div>
      </div>

      <div className="comparison-grid">
        <PlanCard summary={summaryA} />
        <PlanCard summary={summaryB} />
      </div>

      <section className="panel-card comparison-deltas" aria-labelledby="comparison-takeaway-title">
        <p className="eyebrow">Direct answer</p>
        <h3 id="comparison-takeaway-title">What changes between the plans</h3>
        <ul>
          <li>{differenceSentence("cost", summaryA.cumulativeCost, summaryB.cumulativeCost)}</li>
          <li>{differenceSentence("emissions", summaryA.cumulativeEmissionsKgCO2, summaryB.cumulativeEmissionsKgCO2)}</li>
          <li>{differenceSentence("power", summaryA.peakPowerKW, summaryB.peakPowerKW)}</li>
        </ul>
      </section>

      <section className="panel-card" aria-labelledby="comparison-chart-title">
        <div className="section-heading-row">
          <div><p className="eyebrow">Plan A versus Plan B</p><h3 id="comparison-chart-title" className="section-title">Trajectory comparison</h3></div>
          <div className="metric-switch" role="group" aria-label="Comparison metric">
            {(["cost", "emissions", "power"] as ComparisonMetric[]).map((item) => <button key={item} type="button" className={metric === item ? "is-active" : ""} aria-pressed={metric === item} onClick={() => setMetric(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}
          </div>
        </div>
        <Suspense fallback={<div className="chart-placeholder" role="status">Loading comparison chart…</div>}>
          <LazyComparisonChart metric={metric} resultA={resultA} resultB={resultB} capacity={workspace.assumptions.sitePowerCapacityKW} />
        </Suspense>
      </section>
    </div>
  );
}

function PlanCard({ summary }: { summary: PlanSummary }) {
  return (
    <article className={`plan-summary-card ${summary.planId}`}>
      <div className="plan-card-heading"><div><p className="eyebrow">Full planning horizon</p><h3>{summary.planName}</h3></div><span className={summary.overloadedYears.length ? "status-badge status-danger" : "status-badge status-safe"}>{summary.overloadedYears.length ? "Capacity exceeded" : "Grid safe"}</span></div>
      <dl>
        <div><dt>Cumulative total cost</dt><dd>{money.format(summary.cumulativeCost)}</dd></div>
        <div><dt>Capital investment</dt><dd>{money.format(summary.capitalCost)}</dd></div>
        <div><dt>Savings vs baseline</dt><dd>{money.format(summary.savingsVsBaseline)}</dd></div>
        <div><dt>Fleet payback</dt><dd>{summary.paybackYear ?? "Not reached"}</dd></div>
        <div><dt>Cumulative emissions</dt><dd>{formatTonnes(summary.cumulativeEmissionsKgCO2)}</dd></div>
        <div><dt>Emissions avoided</dt><dd>{formatTonnes(summary.emissionsAvoidedKgCO2)}</dd></div>
        <div><dt>Peak demand</dt><dd>{wholeNumber.format(summary.peakPowerKW)} kW</dd></div>
        <div><dt>EVs by final year</dt><dd>{summary.electricVehiclesAtEnd} / 100</dd></div>
        <div><dt>Overloaded years</dt><dd>{summary.overloadedYears.length ? summary.overloadedYears.join(", ") : "None"}</dd></div>
      </dl>
    </article>
  );
}

function differenceSentence(kind: "cost" | "emissions" | "power", a: number, b: number): string {
  const difference = b - a;
  if (Math.abs(difference) < 0.5) return `Both plans have the same ${kind}.`;
  const direction = difference < 0 ? "less" : "more";
  const formatted = kind === "cost" ? compactMoney.format(Math.abs(difference)) : kind === "emissions" ? formatTonnes(Math.abs(difference)) : `${wholeNumber.format(Math.abs(difference))} kW`;
  if (kind === "cost") return `Plan B costs ${formatted} ${direction} than Plan A.`;
  if (kind === "emissions") return `Plan B emits ${formatted} ${direction} than Plan A.`;
  return `Plan B draws ${formatted} ${direction} peak power than Plan A.`;
}
