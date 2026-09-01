import type { TransitionPlanResult, YearResult } from "@fleet/core";

function money(value: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(value);
}

function Card({
  title,
  value,
  warning = false,
}: {
  title: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl border p-4",
        warning
          ? "border-red-500/60 bg-red-500/10"
          : "border-zinc-800 bg-zinc-900/60",
      ].join(" ")}
    >
      <div className="text-xs uppercase tracking-wide text-zinc-500">
        {title}
      </div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

export function KpiCards({
  yearResult,
  result,
}: {
  yearResult: YearResult;
  result: TransitionPlanResult;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <Card title="Annual cost" value={money(yearResult.annualTotalCost)} />
      <Card
        title="Annual emissions"
        value={`${Math.round(yearResult.annualEmissionsKgCO2 / 1000)} t CO₂`}
      />
      <Card
        title="Electric fleet"
        value={`${yearResult.electricVehicles}/${yearResult.electricVehicles + yearResult.dieselVehicles}`}
      />
      <Card
        title="Peak power"
        value={`${Math.round(yearResult.peakPowerKW)} kW`}
        warning={yearResult.exceedsSiteCapacity}
      />
      <Card
        title="Payback"
        value={result.paybackYear ? String(result.paybackYear) : "Not reached"}
      />
    </div>
  );
}
