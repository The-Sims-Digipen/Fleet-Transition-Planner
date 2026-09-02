import { lazy, Suspense } from "react";
import type { TransitionPlanResult, YearResult } from "../domain/fleet";
import { AssumptionsPanel } from "./AssumptionsPanel";
import { CapacityGauge } from "./CapacityGauge";
import { KpiCards } from "./KpiCards";
import { PlanSwitch } from "./PlanSwitch";
import { Timeline } from "./Timeline";

const LazyCostChart = lazy(() => import("./CostChart").then((module) => ({ default: module.CostChart })));

export function OverviewPanel({ result, yearResult }: {
  result: TransitionPlanResult;
  yearResult: YearResult;
}) {
  return (
    <div className="workspace-stack">
      <div className="workspace-intro">
        <div>
          <p className="eyebrow">Depot electrification studio</p>
          <h2>Plan overview</h2>
          <p>Test transition timing, operating assumptions, and physical power limits.</p>
        </div>
        <PlanSwitch />
      </div>
      <div className="overview-control-grid">
        <Timeline />
        <CapacityGauge yearResult={yearResult} />
      </div>
      {yearResult.exceedsSiteCapacity && (
        <div className="alert-banner" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 9v5M12 17.5v.5" />
          </svg>
          <span>The selected plan exceeds site power capacity in {yearResult.year}. Reduce active chargers or increase the configured capacity.</span>
        </div>
      )}
      <KpiCards yearResult={yearResult} result={result} />
      <Suspense fallback={<div className="chart-placeholder" role="status">Loading cost chart…</div>}>
        <LazyCostChart result={result} selectedYear={yearResult.year} />
      </Suspense>
      <AssumptionsPanel />
    </div>
  );
}
