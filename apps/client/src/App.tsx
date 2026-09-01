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
    <main className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950/95">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5">
          <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">
            Digital Twin
          </div>
          <h1 className="break-words text-xl font-semibold sm:text-2xl">
            Fleet Transition Planner
          </h1>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1600px] min-w-0 gap-4 p-3 sm:gap-5 sm:p-5 xl:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)]">
        <aside className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-1">
          <AssumptionsPanel />
          <VehicleList />
        </aside>

        <section className="min-w-0 space-y-4 sm:space-y-5">
          <KpiCards yearResult={yearResult} result={result} />

          {yearResult.exceedsSiteCapacity && (
            <div className="min-w-0 break-words rounded-xl border border-red-500/60 bg-red-500/10 px-3 py-3 text-sm text-red-100 sm:px-4">
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
