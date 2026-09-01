import { describe, expect, it } from "vitest";
import { calculateTransitionPlan } from "./calculateTransitionPlan.js";
import type { Scenario } from "./types.js";

describe("calculateTransitionPlan", () => {
  it("moves vehicles from diesel to electric in the assigned year", () => {
    const scenario: Scenario = {
      id: "test",
      name: "Test",
      assumptions: {
        dieselPricePerLitre: 2.8,
        electricityPricePerKWh: 0.3,
        dieselLitresPer100Km: 9,
        electricKWhPer100Km: 22,
        dieselKgCO2PerLitre: 2.68,
        gridKgCO2PerKWh: 0.4,
        electricVehiclePurchaseCost: 60000,
        chargerCost: 4000,
        chargerPowerKW: 22,
        sitePowerCapacityKW: 100,
        startYear: 2026,
        endYear: 2028
      },
      vehicles: [
        {
          id: "v1",
          registration: "TEST-1",
          category: "Van",
          annualDistanceKm: 30000,
          currentAgeYears: 5,
          transitionYear: 2027,
          parkingPosition: { x: 0, z: 0 }
        }
      ]
    };

    const result = calculateTransitionPlan(scenario);

    expect(result.years[0].electricVehicles).toBe(0);
    expect(result.years[1].electricVehicles).toBe(1);
    expect(result.years[2].electricVehicles).toBe(1);
  });
});
