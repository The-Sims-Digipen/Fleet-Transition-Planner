import { create } from "zustand";
import type { Assumptions, Scenario } from "@fleet/core";
import { sampleScenario } from "../sampleScenario";

interface PlannerState {
  scenario: Scenario;
  selectedYear: number;

  setSelectedYear: (year: number) => void;
  setVehicleTransitionYear: (
    vehicleId: string,
    year: number | null,
  ) => void;
  updateAssumption: <K extends keyof Assumptions>(
    key: K,
    value: Assumptions[K],
  ) => void;
}

export const usePlannerStore = create<PlannerState>((set) => ({
  scenario: sampleScenario,
  selectedYear: sampleScenario.assumptions.startYear,

  setSelectedYear: (selectedYear) => set({ selectedYear }),

  setVehicleTransitionYear: (vehicleId, transitionYear) =>
    set((state) => ({
      scenario: {
        ...state.scenario,
        vehicles: state.scenario.vehicles.map((vehicle) =>
          vehicle.id === vehicleId
            ? { ...vehicle, transitionYear }
            : vehicle,
        ),
      },
    })),

  updateAssumption: (key, value) =>
    set((state) => ({
      scenario: {
        ...state.scenario,
        assumptions: {
          ...state.scenario.assumptions,
          [key]: value,
        },
      },
    })),
}));
