import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { sampleScenario } from "../sampleScenario";
import { usePlannerStore } from "../store/plannerStore";
import { VehicleList } from "./VehicleList";

function resetPlannerStore() {
  usePlannerStore.setState({
    scenario: structuredClone(sampleScenario),
    selectedYear: sampleScenario.assumptions.startYear,
  });
}

describe("VehicleList", () => {
  beforeEach(resetPlannerStore);

  it("updates a vehicle's transition year through the user-facing select", async () => {
    const user = userEvent.setup();
    render(<VehicleList />);

    const transitionSelectors = screen.getAllByRole("combobox");
    const firstVehicleSelector = transitionSelectors[0];

    await user.selectOptions(firstVehicleSelector, "2029");

    expect(firstVehicleSelector).toHaveValue("2029");
    expect(
      usePlannerStore.getState().scenario.vehicles[0].transitionYear,
    ).toBe(2029);
  });
});
