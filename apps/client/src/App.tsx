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

  const result = useMemo(() => calculateTransitionPlan(scenario), [scenario]);

  const yearResult =
    result.years.find((item) => item.year === selectedYear) ?? result.years[0];

  return (
    <main className="min-h-screen w-full bg-[#0a0f1d] text-slate-100">
      <header className="border-b border-slate-800/80 bg-[#0f172a]/95 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
            Digital Twin
          </div>
          <h1 className="break-words text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
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
            <div className="flex min-w-0 items-start gap-3 rounded-xl border border-red-500/70 bg-red-500/10 px-3 py-3 text-sm text-red-100 shadow-[0_0_24px_rgba(239,68,68,0.14)] sm:px-4">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 3 2.5 20h19L12 3Z" />
                <path d="M12 9v5M12 17.5v.5" />
              </svg>
              <span>
                Site power capacity exceeded in {selectedYear}. The plan requires{" "}
                {Math.round(yearResult.peakPowerKW)} kW, above the configured{" "}
                {scenario.assumptions.sitePowerCapacityKW} kW ceiling.
              </span>
            </div>
          )}

          <DepotScene yearResult={yearResult} />
          <Timeline />
          <CostChart result={result} />
        </section>
      </div>
    </main>
  );
}
