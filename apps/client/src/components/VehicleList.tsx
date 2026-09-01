import { usePlannerStore } from "../store/plannerStore";

export function VehicleList() {
  const scenario = usePlannerStore((state) => state.scenario);
  const setVehicleTransitionYear = usePlannerStore((state) => state.setVehicleTransitionYear);

  const years = Array.from(
    { length: scenario.assumptions.endYear - scenario.assumptions.startYear + 1 },
    (_, index) => scenario.assumptions.startYear + index,
  );

  return (
    <section className="min-w-0 rounded-2xl border border-slate-700/70 bg-slate-800/55 p-3 shadow-[0_14px_36px_rgba(0,0,0,0.2)] backdrop-blur-lg sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-300">Fleet</h2>
        <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-400">
          {scenario.vehicles.length} vehicles
        </span>
      </div>

      <div className="space-y-2">
        {scenario.vehicles.map((vehicle) => (
          <div key={vehicle.id} className="min-w-0 rounded-xl border border-slate-700/70 bg-slate-950/55 p-3 transition hover:border-sky-400/40 hover:bg-slate-800/70">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="break-words text-sm font-bold text-slate-100">{vehicle.registration}</div>
                <div className="break-words text-xs text-slate-500">
                  {vehicle.annualDistanceKm.toLocaleString()} km/year
                </div>
              </div>

              <select
                aria-label={`${vehicle.registration} transition year`}
                className="min-w-0 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs font-semibold text-slate-200 outline-none transition focus:border-sky-400 sm:w-auto sm:max-w-full"
                value={vehicle.transitionYear ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setVehicleTransitionYear(vehicle.id, value === "" ? null : Number(value));
                }}
              >
                <option value="">Keep diesel</option>
                {years.map((year) => (
                  <option key={year} value={year}>EV {year}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
