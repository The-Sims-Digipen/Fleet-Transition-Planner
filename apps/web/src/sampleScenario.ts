import type { Scenario } from "@fleet/core";

export const sampleScenario: Scenario = {
  id: "scenario-a",
  name: "Scenario A",
  assumptions: {
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
    endYear: 2032
  },
  vehicles: [
    {
      id: "v-001",
      registration: "SGV-001",
      category: "Delivery Van",
      annualDistanceKm: 42000,
      currentAgeYears: 8,
      transitionYear: 2026,
      parkingPosition: { x: -6, z: -2 }
    },
    {
      id: "v-002",
      registration: "SGV-002",
      category: "Delivery Van",
      annualDistanceKm: 36000,
      currentAgeYears: 6,
      transitionYear: 2027,
      parkingPosition: { x: -2, z: -2 }
    },
    {
      id: "v-003",
      registration: "SGV-003",
      category: "Delivery Van",
      annualDistanceKm: 28000,
      currentAgeYears: 4,
      transitionYear: 2028,
      parkingPosition: { x: 2, z: -2 }
    },
    {
      id: "v-004",
      registration: "SGV-004",
      category: "Service Van",
      annualDistanceKm: 18000,
      currentAgeYears: 5,
      transitionYear: 2030,
      parkingPosition: { x: 6, z: -2 }
    },
    {
      id: "v-005",
      registration: "SGV-005",
      category: "Service Van",
      annualDistanceKm: 9000,
      currentAgeYears: 2,
      transitionYear: null,
      parkingPosition: { x: -6, z: 3 }
    },
    {
      id: "v-006",
      registration: "SGV-006",
      category: "Service Van",
      annualDistanceKm: 12000,
      currentAgeYears: 3,
      transitionYear: 2031,
      parkingPosition: { x: -2, z: 3 }
    }
  ]
};
