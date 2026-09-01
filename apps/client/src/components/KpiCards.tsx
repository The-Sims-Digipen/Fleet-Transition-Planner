import type { TransitionPlanResult, YearResult } from "../domain/fleet";

function money(value: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(value);
}

function Card({ title, value, warning = false, highlight = false }: {
  title: string;
  value: string;
  warning?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={[
      "min-w-0 rounded-2xl border p-3 shadow-[0_12px_30px_rgba(0,0,0,0.16)] backdrop-blur-lg sm:p-4",
      warning
        ? "border-red-500/60 bg-red-500/10"
        : "border-slate-700/70 bg-slate-800/55",
    ].join(" ")}>
      <div className="break-words text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">{title}</div>
      <div className={`mt-1 break-words text-lg font-bold sm:text-xl ${highlight ? "text-emerald-400" : "text-slate-50"}`}>
        {value}
      </div>
    </div>
  );
}

export function KpiCards({ yearResult, result }: { yearResult: YearResult; result: TransitionPlanResult }) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      <Card title="Annual cost" value={money(yearResult.annualTotalCost)} />
      <Card title="Annual emissions" value={`${Math.round(yearResult.annualEmissionsKgCO2 / 1000)} t CO₂`} highlight />
      <Card title="Electric fleet" value={`${yearResult.electricVehicles}/${yearResult.electricVehicles + yearResult.dieselVehicles}`} />
      <Card title="Peak power" value={`${Math.round(yearResult.peakPowerKW)} kW`} warning={yearResult.exceedsSiteCapacity} />
      <Card title="Payback" value={result.paybackYear ? String(result.paybackYear) : "Not reached"} />
    </div>
  );
}
