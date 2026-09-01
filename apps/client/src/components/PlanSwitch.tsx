import type { PlanId } from "../domain/fleet";
import { usePlannerStore } from "../store/plannerStore";

export function PlanSwitch({ label = "Active plan" }: { label?: string }) {
  const activePlanId = usePlannerStore((state) => state.activePlanId);
  const setActivePlanId = usePlannerStore((state) => state.setActivePlanId);
  const plans = usePlannerStore((state) => state.workspace.plans);

  return (
    <div className="plan-switch" role="group" aria-label={label}>
      {(["planA", "planB"] as PlanId[]).map((planId) => (
        <button
          key={planId}
          type="button"
          className={activePlanId === planId ? "is-active" : ""}
          aria-pressed={activePlanId === planId}
          onClick={() => setActivePlanId(planId)}
        >
          {plans[planId].name}
        </button>
      ))}
    </div>
  );
}
