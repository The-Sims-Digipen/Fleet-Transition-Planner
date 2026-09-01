import { beforeEach, describe, expect, it } from "vitest";
import { sampleAssumptions, sampleWorkspace } from "../sampleScenario";
import { usePlannerStore } from "./plannerStore";

function resetStore() {
  usePlannerStore.setState({
    workspace: structuredClone(sampleWorkspace),
    activePlanId: "planA",
    selectedYear: sampleAssumptions.startYear,
    selectedVehicleId: null,
    selectedVehicleIds: [],
    previousOptimizedPlan: null,
    optimizationNotice: null,
  });
}

describe("plannerStore", () => {
  beforeEach(resetStore);

  it("keeps Plan A and Plan B schedules independent", () => {
    const store = usePlannerStore.getState();
    store.setActivePlanId("planB");
    usePlannerStore.getState().setVehicleTransitionYear("v-001", null);
    const state = usePlannerStore.getState();
    expect(state.workspace.plans.planA.vehicles[0].transitionYear).toBe(2026);
    expect(state.workspace.plans.planB.vehicles[0].transitionYear).toBeNull();
  });

  it("uses one shared assumption set for both plans", () => {
    usePlannerStore.getState().updateAssumption("dieselPricePerLitre", 4.25);
    expect(usePlannerStore.getState().workspace.assumptions.dieselPricePerLitre).toBe(4.25);
    expect(usePlannerStore.getState().workspace.plans.planA).not.toHaveProperty("assumptions");
    expect(usePlannerStore.getState().workspace.plans.planB).not.toHaveProperty("assumptions");
  });

  it("bulk schedules selected vehicles and clears the selection", () => {
    usePlannerStore.getState().setSelectedVehicleIds(["v-001", "v-002"]);
    usePlannerStore.getState().setVehiclesTransitionYear(["v-001", "v-002"], 2030);
    const state = usePlannerStore.getState();
    expect(state.workspace.plans.planA.vehicles.slice(0, 2).map((vehicle) => vehicle.transitionYear)).toEqual([2030, 2030]);
    expect(state.selectedVehicleIds).toEqual([]);
  });

  it("can undo the one-click optimization", () => {
    const before = structuredClone(usePlannerStore.getState().workspace.plans.planA);
    usePlannerStore.getState().optimizeActivePlan();
    expect(usePlannerStore.getState().workspace.plans.planA).not.toEqual(before);
    expect(usePlannerStore.getState().optimizationNotice).not.toBeNull();
    usePlannerStore.getState().undoOptimization();
    expect(usePlannerStore.getState().workspace.plans.planA).toEqual(before);
    expect(usePlannerStore.getState().optimizationNotice).toBeNull();
  });
});
