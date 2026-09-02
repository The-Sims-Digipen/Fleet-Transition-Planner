import type { TransitionPlanResult, YearResult } from "../domain/fleet";
import { compactMoney, formatTonnes } from "../utils/format";

function Metric({ title, value, tone = "neutral", detail }: {
  title: string;
  value: string;
  tone?: "neutral" | "positive" | "warning";
  detail?: string;
}) {
  return (
    <div className={`kpi-metric tone-${tone}`}>
      <dt>{title}</dt>
      <dd>
        <strong>{value}</strong>
        {detail && <span>{detail}</span>}
      </dd>
    </div>
  );
}

export function KpiCards({ yearResult, result }: {
  yearResult: YearResult;
  result: TransitionPlanResult;
}) {
  const totalVehicles = yearResult.electricVehicles + yearResult.dieselVehicles;
  return (
    <dl className="kpi-summary" aria-label="Selected year key results">
      <Metric title="Annual total cost" value={compactMoney.format(yearResult.annualTotalCost)} />
      <Metric
        title="Annual operating savings"
        value={compactMoney.format(yearResult.annualSavingsVsBaseline)}
        tone={yearResult.annualSavingsVsBaseline >= 0 ? "positive" : "warning"}
        detail="versus all-diesel"
      />
      <Metric title="Annual emissions" value={formatTonnes(yearResult.annualEmissionsKgCO2)} tone="positive" />
      <Metric title="Electric fleet" value={`${yearResult.electricVehicles} / ${totalVehicles}`} detail={`${Math.round((yearResult.electricVehicles / totalVehicles) * 100)}% electrified`} />
      <Metric title="Fleet payback" value={result.paybackYear ? String(result.paybackYear) : "Not reached"} />
    </dl>
  );
}
