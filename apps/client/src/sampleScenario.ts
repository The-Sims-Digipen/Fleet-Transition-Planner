import type {
  Assumptions,
  PlannerWorkspace,
  Scenario,
  TransitionPlan,
  Vehicle,
} from "./domain/fleet";

export const sampleAssumptions: Assumptions = {
  dieselPricePerLitre: 2.8,
  electricityPricePerKWh: 0.32,
  dieselLitresPer100Km: 9.2,
  electricKWhPer100Km: 22,
  dieselKgCO2PerLitre: 2.68,
  gridKgCO2PerKWh: 0.4,
  electricVehiclePurchaseCost: 62000,
  chargerCost: 4500,
  chargerPowerKW: 22,
  sitePowerCapacityKW: 180,
  startYear: 2026,
  endYear: 2032,
};

function createVehicles(): Vehicle[] {
  return Array.from({ length: 100 }, (_, index) => {
    const number = index + 1;
    const column = index % 20;
    const row = Math.floor(index / 20);
    return {
      id: `v-${String(number).padStart(3, "0")}`,
      registration: `SGV-${String(number).padStart(3, "0")}`,
      category: index % 2 === 0 ? "Delivery Van" : "Service Van",
      annualDistanceKm: 8000 + ((index * 7919) % 53000),
      currentAgeYears: 1 + ((index * 5) % 10),
      transitionYear:
        index < 8
          ? sampleAssumptions.startYear +
            (index %
              (sampleAssumptions.endYear - sampleAssumptions.startYear + 1))
          : null,
      parkingPosition: {
        x: (column - 9.5) * 3.9,
        z: (row - 2) * 6.2 + 3,
      },
    };
  });
}

const vehicles = createVehicles();

export const samplePlanA: TransitionPlan = {
  id: "planA",
  name: "Plan A",
  vehicles,
};

export const samplePlanB: TransitionPlan = {
  id: "planB",
  name: "Plan B",
  vehicles: structuredClone(vehicles),
};

export const sampleWorkspace: PlannerWorkspace = {
  assumptions: sampleAssumptions,
  plans: {
    planA: samplePlanA,
    planB: samplePlanB,
  },
};

/** Compatibility value for focused domain examples that need one scenario. */
export const sampleScenario: Scenario = {
  ...samplePlanA,
  assumptions: sampleAssumptions,
};
