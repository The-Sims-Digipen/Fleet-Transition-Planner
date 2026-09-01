import { usePlannerStore } from "../store/plannerStore";

export function Timeline() {
  const scenario = usePlannerStore((state) => state.scenario);
  const selectedYear = usePlannerStore((state) => state.selectedYear);
  const setSelectedYear = usePlannerStore(
    (state) => state.setSelectedYear,
  );

  return (
    <section className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4">
      <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
        <h2 className="min-w-0 break-words text-sm font-semibold uppercase tracking-wide text-zinc-300">
          Transition year
        </h2>
        <div className="shrink-0 text-xl font-bold sm:text-2xl">
          {selectedYear}
        </div>
      </div>

      <input
        aria-label="Transition year"
        className="block w-full min-w-0"
        type="range"
        min={scenario.assumptions.startYear}
        max={scenario.assumptions.endYear}
        step={1}
        value={selectedYear}
        onChange={(event) => setSelectedYear(Number(event.target.value))}
      />

      <div className="mt-1 flex min-w-0 justify-between gap-3 text-xs text-zinc-500">
        <span>{scenario.assumptions.startYear}</span>
        <span>{scenario.assumptions.endYear}</span>
      </div>
    </section>
  );
}
