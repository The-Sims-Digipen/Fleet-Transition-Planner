import { usePlannerStore } from "../store/plannerStore";

export function Timeline() {
  const assumptions = usePlannerStore((state) => state.workspace.assumptions);
  const selectedYear = usePlannerStore((state) => state.selectedYear);
  const setSelectedYear = usePlannerStore((state) => state.setSelectedYear);
  const years = Array.from(
    { length: assumptions.endYear - assumptions.startYear + 1 },
    (_, index) => assumptions.startYear + index,
  );

  return (
    <section className="panel-card timeline-card" aria-labelledby="timeline-title">
      <div className="section-heading-row compact-heading">
        <div>
          <h2 id="timeline-title" className="section-title">Transition timeline</h2>
          <p className="section-caption">Scrub to inspect the depot</p>
        </div>
        <output className="year-output" aria-live="polite">{selectedYear}</output>
      </div>
      <input
        aria-label="Transition year"
        className="timeline-input"
        type="range"
        min={assumptions.startYear}
        max={assumptions.endYear}
        step={1}
        value={selectedYear}
        onChange={(event) => setSelectedYear(Number(event.target.value))}
      />
      <div className="timeline-ticks" aria-hidden="true">
        {years.map((year) => (
          <span key={year} className={year === selectedYear ? "is-active" : ""}>{year}</span>
        ))}
      </div>
    </section>
  );
}
