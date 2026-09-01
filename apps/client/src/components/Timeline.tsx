import { usePlannerStore } from "../store/plannerStore";

export function Timeline() {
  const scenario = usePlannerStore((state) => state.scenario);
  const selectedYear = usePlannerStore((state) => state.selectedYear);
  const setSelectedYear = usePlannerStore((state) => state.setSelectedYear);

  return (
    <section className="min-w-0 rounded-2xl border border-slate-700/70 bg-slate-800/55 p-3 shadow-[0_14px_36px_rgba(0,0,0,0.2)] backdrop-blur-lg sm:p-4">
      <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
        <h2 className="min-w-0 break-words text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
          Transition timeline
        </h2>
        <div className="shrink-0 text-2xl font-extrabold tabular-nums text-sky-400">{selectedYear}</div>
      </div>

      <input
        aria-label="Transition year"
        className="timeline-input block w-full min-w-0"
        type="range"
        min={scenario.assumptions.startYear}
        max={scenario.assumptions.endYear}
        step={1}
        value={selectedYear}
        onChange={(event) => setSelectedYear(Number(event.target.value))}
      />

      <div className="mt-2 flex min-w-0 justify-between gap-3 text-xs font-semibold text-slate-500">
        <span>{scenario.assumptions.startYear}</span>
        <span>{scenario.assumptions.endYear}</span>
      </div>
    </section>
  );
}
