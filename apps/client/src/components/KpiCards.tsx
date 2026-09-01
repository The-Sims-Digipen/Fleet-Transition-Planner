import type { TransitionPlanResult, YearResult } from "../domain/fleet";
import { compactMoney, formatTonnes } from "../utils/format";

function Card({ title, value, tone = "neutral", detail }: {
  title: string;
  value: string;
  tone?: "neutral" | "positive" | "warning";
  detail?: string;
}) {
  return (
    <article className={`kpi-card tone-${tone}`}>
      <p>{title}</p>
      <strong>{value}</strong>
      {detail && <span>{detail}</span>}
    </article>
  );
}

export function KpiCards({ yearResult, result }: {
  yearResult: YearResult;
  result: TransitionPlanResult;
}) {
  const totalVehicles = yearResult.electricVehicles + yearResult.dieselVehicles;
  return (
    <div className="kpi-grid" aria-label="Selected year key results">
      <Card title="Annual total cost" value={compactMoney.format(yearResult.annualTotalCost)} />
      <Card
        title="Annual operating savings"
        value={compactMoney.format(yearResult.annualSavingsVsBaseline)}
        tone={yearResult.annualSavingsVsBaseline >= 0 ? "positive" : "warning"}
        detail="versus all-diesel"
      />
      <Card title="Annual emissions" value={formatTonnes(yearResult.annualEmissionsKgCO2)} tone="positive" />
      <Card title="Electric fleet" value={`${yearResult.electricVehicles} / ${totalVehicles}`} detail={`${Math.round((yearResult.electricVehicles / totalVehicles) * 100)}% electrified`} />
      <Card title="Fleet payback" value={result.paybackYear ? String(result.paybackYear) : "Not reached"} />
    </div>
  );
}
