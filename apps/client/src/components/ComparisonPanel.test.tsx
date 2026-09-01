import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sampleAssumptions, sampleWorkspace } from "../sampleScenario";
import { usePlannerStore } from "../store/plannerStore";
import { ComparisonPanel } from "./ComparisonPanel";

vi.mock("./ComparisonChart", () => ({
  ComparisonChart: () => <div>Comparison chart</div>,
}));

beforeEach(() => {
  usePlannerStore.setState({
    workspace: structuredClone(sampleWorkspace),
    activePlanId: "planA",
    selectedYear: sampleAssumptions.startYear,
    selectedVehicleId: null,
    selectedVehicleIds: [],
    previousOptimizedPlan: null,
    optimizationNotice: null,
  });
});

describe("ComparisonPanel", () => {
  it("shows aligned plan summaries and a direct delta", async () => {
    render(<ComparisonPanel />);
    expect(screen.getByRole("heading", { name: "Plan A" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Plan B" })).toBeInTheDocument();
    expect(screen.getByText("Both plans have the same cost.")).toBeInTheDocument();
    expect(await screen.findByText("Comparison chart")).toBeInTheDocument();
  });

  it("loads either comparison plan into the depot", async () => {
    const user = userEvent.setup();
    render(<ComparisonPanel />);
    await user.click(screen.getByRole("button", { name: "View Plan B in depot" }));
    expect(usePlannerStore.getState().activePlanId).toBe("planB");
  });
});
