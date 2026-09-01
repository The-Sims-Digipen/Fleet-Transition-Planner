import { usePlannerStore } from "../store/plannerStore";

export function VehicleList() {
  const scenario = usePlannerStore((state) => state.scenario);
  const setVehicleTransitionYear = usePlannerStore(
    (state) => state.setVehicleTransitionYear,
  );

  const years = Array.from(
    {
      length:
        scenario.assumptions.endYear -
        scenario.assumptions.startYear +
        1,
    },
    (_, index) => scenario.assumptions.startYear + index,
  );

  return (
    <section className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">
        Fleet
      </h2>

      <div className="space-y-2">
        {scenario.vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3"
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="break-words text-sm font-medium">
                  {vehicle.registration}
                </div>
                <div className="break-words text-xs text-zinc-500">
                  {vehicle.annualDistanceKm.toLocaleString()} km/year
                </div>
              </div>

              <select
                aria-label={`${vehicle.registration} transition year`}
                className="min-w-0 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs sm:w-auto sm:max-w-full"
                value={vehicle.transitionYear ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setVehicleTransitionYear(
                    vehicle.id,
                    value === "" ? null : Number(value),
                  );
                }}
              >
                <option value="">Keep diesel</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    EV {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
