import { usePlannerStore } from "../store/plannerStore";

export function Timeline() {
  const scenario = usePlannerStore((state) => state.scenario);
  const selectedYear = usePlannerStore((state) => state.selectedYear);
  const setSelectedYear = usePlannerStore(
    (state) => state.setSelectedYear,
  );

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
          Transition year
        </h2>
        <div className="text-2xl font-bold">{selectedYear}</div>
      </div>

      <input
        className="w-full"
        type="range"
        min={scenario.assumptions.startYear}
        max={scenario.assumptions.endYear}
        step={1}
        value={selectedYear}
        onChange={(event) => setSelectedYear(Number(event.target.value))}
      />

      <div className="mt-1 flex justify-between text-xs text-zinc-500">
        <span>{scenario.assumptions.startYear}</span>
        <span>{scenario.assumptions.endYear}</span>
      </div>
    </section>
  );
}
