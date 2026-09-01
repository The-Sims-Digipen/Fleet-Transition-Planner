import type { Assumptions } from "../domain/fleet";
import { usePlannerStore } from "../store/plannerStore";

type NumericAssumptionKey =
  | "dieselPricePerLitre"
  | "electricityPricePerKWh"
  | "electricVehiclePurchaseCost"
  | "chargerCost"
  | "chargerPowerKW"
  | "sitePowerCapacityKW";

const fields: Array<{ key: NumericAssumptionKey; label: string; step: number }> = [
  { key: "dieselPricePerLitre", label: "Diesel $/L", step: 0.01 },
  { key: "electricityPricePerKWh", label: "Electricity $/kWh", step: 0.01 },
  { key: "electricVehiclePurchaseCost", label: "EV purchase cost", step: 1000 },
  { key: "chargerCost", label: "Charger cost", step: 100 },
  { key: "chargerPowerKW", label: "Charger power (kW)", step: 1 },
  { key: "sitePowerCapacityKW", label: "Site capacity (kW)", step: 10 },
];

export function AssumptionsPanel() {
  const assumptions = usePlannerStore((state) => state.scenario.assumptions);
  const updateAssumption = usePlannerStore((state) => state.updateAssumption);

  return (
    <section className="min-w-0 rounded-2xl border border-slate-700/70 bg-slate-800/55 p-3 shadow-[0_14px_36px_rgba(0,0,0,0.2)] backdrop-blur-lg sm:p-4">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-sky-400">
        Editable assumptions
      </h2>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
        {fields.map((field) => (
          <label key={field.key} className="min-w-0">
            <span className="mb-1 block break-words text-xs font-medium text-slate-400">
              {field.label}
            </span>
            <input
              className="min-w-0 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm font-semibold text-sky-300 outline-none transition focus:border-sky-400 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.12)]"
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
