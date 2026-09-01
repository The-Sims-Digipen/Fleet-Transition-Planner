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
}> = [
  { key: "dieselPricePerLitre", label: "Diesel $/L", step: 0.01 },
  { key: "electricityPricePerKWh", label: "Electricity $/kWh", step: 0.01 },
  {
    key: "electricVehiclePurchaseCost",
    label: "EV purchase cost",
    step: 1000,
  },
  { key: "chargerCost", label: "Charger cost", step: 100 },
  { key: "chargerPowerKW", label: "Charger power (kW)", step: 1 },
  { key: "sitePowerCapacityKW", label: "Site capacity (kW)", step: 10 },
];

export function AssumptionsPanel() {
  const assumptions = usePlannerStore(
    (state) => state.scenario.assumptions,
  );
  const updateAssumption = usePlannerStore(
    (state) => state.updateAssumption,
  );

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-300">
        Assumptions
      </h2>

      <div className="space-y-3">
        {fields.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-1 block text-xs text-zinc-400">
              {field.label}
            </span>
            <input
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              type="number"
              step={field.step}
              value={assumptions[field.key]}
              onChange={(event) =>
                updateAssumption(
                  field.key,
                  Number(event.target.value) as Assumptions[typeof field.key],
                )
              }
            />
          </label>
        ))}
      </div>
    </section>
  );
}
