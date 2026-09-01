import { calculateVehicleEconomics } from "../domain/fleet";
import { usePlannerStore } from "../store/plannerStore";
import { formatPayback, money, wholeNumber } from "../utils/format";

export function VehicleInspector() {
  const activePlanId = usePlannerStore((state) => state.activePlanId);
  const plan = usePlannerStore((state) => state.workspace.plans[activePlanId]);
  const assumptions = usePlannerStore((state) => state.workspace.assumptions);
  const selectedVehicleId = usePlannerStore((state) => state.selectedVehicleId);
  const setSelectedVehicleId = usePlannerStore((state) => state.setSelectedVehicleId);
  const setVehicleTransitionYear = usePlannerStore((state) => state.setVehicleTransitionYear);
  const vehicleIndex = plan.vehicles.findIndex((item) => item.id === selectedVehicleId);
  if (vehicleIndex < 0) return null;

  const vehicle = plan.vehicles[vehicleIndex];
  const economics = calculateVehicleEconomics(vehicle, assumptions);
  const years = Array.from(
    { length: assumptions.endYear - assumptions.startYear + 1 },
    (_, index) => assumptions.startYear + index,
  );

  return (
    <aside className="vehicle-inspector" aria-labelledby="inspector-title">
      <div className="inspector-heading">
        <div>
          <p className="eyebrow">Bay {String(vehicleIndex + 1).padStart(2, "0")}</p>
          <h2 id="inspector-title">{vehicle.registration}</h2>
          <span>{vehicle.category}</span>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="Close vehicle inspector"
          onClick={() => setSelectedVehicleId(null)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <dl className="inspector-stats">
        <div><dt>Annual distance</dt><dd>{wholeNumber.format(vehicle.annualDistanceKm)} km</dd></div>
        <div><dt>Annual savings</dt><dd>{money.format(economics.annualSavings)}</dd></div>
        <div><dt>Payback</dt><dd>{formatPayback(economics.paybackYears)}</dd></div>
      </dl>
      <label className="field-label" htmlFor="inspector-transition-year">
        <span>Transition year</span>
        <select
          id="inspector-transition-year"
          className="field-control"
          value={vehicle.transitionYear ?? ""}
          onChange={(event) => setVehicleTransitionYear(
            vehicle.id,
            event.target.value === "" ? null : Number(event.target.value),
          )}
        >
          <option value="">Retain diesel</option>
          {years.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </label>
    </aside>
  );
}
