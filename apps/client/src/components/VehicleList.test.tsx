import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { sampleAssumptions, sampleWorkspace } from "../sampleScenario";
import { usePlannerStore } from "../store/plannerStore";
import { FleetPlanner } from "./FleetPlanner";

function resetPlannerStore() {
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

describe("FleetPlanner", () => {
  beforeEach(resetPlannerStore);

  it("updates a searched vehicle's transition year", async () => {
    const user = userEvent.setup();
    render(<FleetPlanner />);
    await user.type(screen.getByRole("searchbox", { name: "Search fleet" }), "SGV-001");
    const transitionSelector = screen.getByRole("combobox", { name: "SGV-001 transition year" });
    await user.selectOptions(transitionSelector, "2029");
    expect(transitionSelector).toHaveValue("2029");
    expect(usePlannerStore.getState().workspace.plans.planA.vehicles[0].transitionYear).toBe(2029);
  });

  it("selects a whole vehicle category for bulk scheduling", async () => {
    const user = userEvent.setup();
    render(<FleetPlanner />);
    await user.click(screen.getByRole("button", { name: "Select Delivery Van (50)" }));
    expect(screen.getByText("50 selected")).toBeInTheDocument();
    expect(usePlannerStore.getState().selectedVehicleIds).toHaveLength(50);
  });

  it("links a vehicle row to the depot inspector selection", async () => {
    const user = userEvent.setup();
    render(<FleetPlanner />);
    await user.type(screen.getByRole("searchbox", { name: "Search fleet" }), "SGV-001");
    await user.click(screen.getByRole("button", { name: "SGV-001" }));
    expect(usePlannerStore.getState().selectedVehicleId).toBe("v-001");
  });

  it("shows only the same six-vehicle cohort as the depot", () => {
    render(<FleetPlanner />);
    const inspector = screen.getByRole("list", { name: "Depot entities" });

    expect(inspector).toHaveAttribute("data-visible-rows", "6");
    expect(within(inspector).getAllByRole("listitem")).toHaveLength(6);
    expect(within(inspector).getByRole("button", { name: "SGV-001" })).toBeInTheDocument();
    expect(within(inspector).getByRole("button", { name: "SGV-006" })).toBeInTheDocument();
    expect(within(inspector).queryByRole("button", { name: "SGV-007" })).not.toBeInTheDocument();
  });

  it("loads a filtered vehicle's six-van cohort into the depot inspector", async () => {
    const user = userEvent.setup();
    render(<FleetPlanner />);

    await user.type(screen.getByRole("searchbox", { name: "Search fleet" }), "SGV-021");
    await user.click(screen.getByRole("button", { name: "Show top match in depot" }));

    const inspector = screen.getByRole("list", { name: "Depot entities" });
    expect(within(inspector).getAllByRole("listitem")).toHaveLength(6);
    expect(within(inspector).getByRole("button", { name: "SGV-019" })).toBeInTheDocument();
    expect(within(inspector).getByRole("button", { name: "SGV-021" })).toBeInTheDocument();
    expect(within(inspector).getByRole("button", { name: "SGV-024" })).toBeInTheDocument();
    expect(usePlannerStore.getState().selectedVehicleId).toBe("v-021");
  });
});
