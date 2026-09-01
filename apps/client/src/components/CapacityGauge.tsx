import type { YearResult } from "../domain/fleet";
import { usePlannerStore } from "../store/plannerStore";
import { wholeNumber } from "../utils/format";

export function CapacityGauge({ yearResult }: { yearResult: YearResult }) {
  const capacity = usePlannerStore((state) => state.workspace.assumptions.sitePowerCapacityKW);
  const percentage = capacity > 0 ? (yearResult.peakPowerKW / capacity) * 100 : 0;
  const status = percentage > 100 ? "Exceeded" : percentage >= 80 ? "Near limit" : "Normal";
  const tone = percentage > 100 ? "danger" : percentage >= 80 ? "warning" : "safe";
  const headroom = Math.max(0, capacity - yearResult.peakPowerKW);

  return (
    <section className={`panel-card capacity-card tone-${tone}`} aria-labelledby="capacity-title">
      <div className="section-heading-row compact-heading">
        <div>
          <p className="eyebrow">Depot substation</p>
          <h2 id="capacity-title" className="section-title">Peak power</h2>
        </div>
        <span className={`status-badge status-${tone}`}>{status}</span>
      </div>
      <div className="capacity-numbers">
        <strong>{wholeNumber.format(yearResult.peakPowerKW)} kW</strong>
        <span>{wholeNumber.format(capacity)} kW capacity</span>
      </div>
      <div
        className="capacity-track"
        role="meter"
        aria-label="Site power capacity used"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percentage)}
        aria-valuetext={`${Math.round(percentage)} percent, ${status}`}
      >
        <span className="capacity-fill" style={{ width: `${Math.min(100, percentage)}%` }} />
      </div>
      <p className="capacity-detail">
        {percentage > 100
          ? `${wholeNumber.format(yearResult.peakPowerKW - capacity)} kW over the configured limit.`
          : `${wholeNumber.format(headroom)} kW headroom remains.`}
      </p>
    </section>
  );
}
