import { useMemo } from "react";
import { calculateTransitionPlan } from "./domain/fleet";
import { usePlannerStore } from "./store/plannerStore";
import { AssumptionsPanel } from "./components/AssumptionsPanel";
import { VehicleList } from "./components/VehicleList";
import { DepotScene } from "./components/DepotScene";
import { Timeline } from "./components/Timeline";
import { KpiCards } from "./components/KpiCards";
import { CostChart } from "./components/CostChart";

export default function App() {
  const scenario = usePlannerStore((state) => state.scenario);
  const selectedYear = usePlannerStore((state) => state.selectedYear);

  const result = useMemo(
    () => calculateTransitionPlan(scenario),
    [scenario],
  );

  const yearResult =
    result.years.find((item) => item.year === selectedYear) ??
    result.years[0];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/95">
        <div className="mx-auto max-w-[1600px] px-5 py-4">
          <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">
            Digital Twin
          </div>
          <h1 className="text-2xl font-semibold">
            Fleet Transition Planner
          </h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-5 p-5 xl:grid-cols-[330px_1fr]">
        <aside className="space-y-5">
          <AssumptionsPanel />
          <VehicleList />
        </aside>

        <section className="space-y-5">
          <KpiCards yearResult={yearResult} result={result} />

          {yearResult.exceedsSiteCapacity && (
            <div className="rounded-xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              Site power capacity exceeded in {selectedYear}. The plan requires{" "}
              {Math.round(yearResult.peakPowerKW)} kW, above the configured{" "}
              {scenario.assumptions.sitePowerCapacityKW} kW ceiling.
            </div>
          )}

          <DepotScene />
          <Timeline />
          <CostChart result={result} />
        </section>
      </div>
    </main>
  );
}
