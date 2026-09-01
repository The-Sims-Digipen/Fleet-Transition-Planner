import type { Assumptions } from "../domain/fleet";
import { usePlannerStore } from "../store/plannerStore";

type NumericAssumptionKey =
  | "dieselPricePerLitre"
  | "electricityPricePerKWh"
  | "electricVehiclePurchaseCost"
  | "chargerCost"
  | "chargerPowerKW"
  | "sitePowerCapacityKW";

const fields: Array<{
  key: NumericAssumptionKey;
  label: string;
  step: number;
  unit: string;
}> = [
  { key: "dieselPricePerLitre", label: "Diesel price", step: 0.01, unit: "SGD/L" },
  { key: "electricityPricePerKWh", label: "Electricity price", step: 0.01, unit: "SGD/kWh" },
  { key: "electricVehiclePurchaseCost", label: "EV purchase cost", step: 1000, unit: "SGD" },
  { key: "chargerCost", label: "Charger cost", step: 100, unit: "SGD" },
  { key: "chargerPowerKW", label: "Charger power", step: 1, unit: "kW" },
  { key: "sitePowerCapacityKW", label: "Site capacity", step: 10, unit: "kW" },
];

export function AssumptionsPanel() {
  const assumptions = usePlannerStore((state) => state.workspace.assumptions);
  const updateAssumption = usePlannerStore((state) => state.updateAssumption);
  const resetAssumptions = usePlannerStore((state) => state.resetAssumptions);

  return (
    <section className="panel-card" aria-labelledby="assumptions-title">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Shared across both plans</p>
          <h2 id="assumptions-title" className="section-title">Editable assumptions</h2>
        </div>
        <button className="secondary-button compact-button" type="button" onClick={resetAssumptions}>
          Reset defaults
        </button>
      </div>

      <div className="assumptions-grid">
        {fields.map((field) => {
          const id = `assumption-${field.key}`;
          return (
            <label key={field.key} className="field-label" htmlFor={id}>
              <span>{field.label}</span>
              <span className="input-shell">
                <input
                  id={id}
                  className="field-control"
                  type="number"
                  min={0}
                  step={field.step}
                  value={assumptions[field.key]}
                  onChange={(event) =>
                    updateAssumption(
                      field.key,
                      Math.max(0, Number(event.target.value)) as Assumptions[typeof field.key],
                    )
                  }
                />
                <span className="field-unit" aria-hidden="true">{field.unit}</span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
