import { describe, expect, it } from "vitest";
import {
  calculatePaybackProjection,
  calculateTransitionPlan,
  calculateVehicleEconomics,
  optimizeTransitionPlan,
  summarizePlan,
} from "./calculateTransitionPlan.js";
import type { Assumptions, TransitionPlan, Vehicle } from "./types.js";

const assumptions: Assumptions = {
  dieselPricePerLitre: 3,
  electricityPricePerKWh: 0.2,
  dieselLitresPer100Km: 10,
  electricKWhPer100Km: 20,
  dieselKgCO2PerLitre: 2.68,
  gridKgCO2PerKWh: 0.4,
  electricVehiclePurchaseCost: 10000,
  chargerCost: 1000,
  chargerPowerKW: 22,
  sitePowerCapacityKW: 44,
  startYear: 2026,
  endYear: 2030,
};

function vehicle(id: string, distance: number, transitionYear: number | null): Vehicle {
  return {
    id,
    registration: id.toUpperCase(),
    category: "Van",
    annualDistanceKm: distance,
    currentAgeYears: Number(id.at(-1)) || 1,
    transitionYear,
    parkingPosition: { x: 0, z: 0 },
  };
}

function plan(vehicles: Vehicle[]): TransitionPlan {
  return { id: "planA", name: "Plan A", vehicles };
}

describe("fleet transition calculations", () => {
  it("moves vehicles from diesel to electric in the assigned year", () => {
    const result = calculateTransitionPlan(plan([vehicle("v1", 30000, 2027)]), assumptions);
    expect(result.years.map((item) => item.electricVehicles)).toEqual([0, 1, 1, 1, 1]);
    expect(result.years[1].annualElectricEnergyCost).toBeGreaterThan(0);
    expect(result.emissionsAvoidedKgCO2).toBeGreaterThan(0);
  });

  it("does not report payback when no transition occurs", () => {
    const result = calculateTransitionPlan(plan([vehicle("v1", 30000, null)]), assumptions);
    expect(result.paybackYear).toBeNull();
    expect(result.payback.points).toEqual([]);
    expect(result.totalCapitalCost).toBe(0);
  });

  it("projects fractional payback beyond the editable planning horizon", () => {
    const result = calculateTransitionPlan(
      plan([vehicle("v1", 10000, assumptions.endYear)]),
      assumptions,
    );

    expect(result.years.at(-1)?.year).toBe(assumptions.endYear);
    expect(result.payback.paybackYears).toBeCloseTo(11000 / 2600, 5);
    expect(result.payback.paybackCalendarYear).toBeCloseTo(2034.230769, 5);
    expect(result.payback.points.at(-1)?.year).toBe(2034);
    expect(result.paybackYear).toBe(2034);
  });

  it("caps a non-viable payback projection at the requested duration", () => {
    const projection = calculatePaybackProjection(
      plan([vehicle("v1", 30000, 2026)]),
      { ...assumptions, electricityPricePerKWh: 2 },
      5,
    );

    expect(projection.paybackYears).toBeNull();
    expect(projection.points).toHaveLength(5);
    expect(projection.points.at(-1)?.elapsedYears).toBe(5);
    expect(projection.points.at(-1)?.netPosition).toBeLessThan(0);
  });

  it("marks a vehicle non-viable when electricity costs more than diesel", () => {
    const economics = calculateVehicleEconomics(vehicle("v1", 30000, null), {
      ...assumptions,
      dieselPricePerLitre: 0.5,
      electricityPricePerKWh: 1,
    });
    expect(economics.annualSavings).toBeLessThan(0);
    expect(economics.paybackYears).toBeNull();
    expect(economics.paybackBand).toBe("not-viable");
  });

  it("produces a complete plan summary", () => {
    const transitionPlan = plan([vehicle("v1", 50000, 2026)]);
    const result = calculateTransitionPlan(transitionPlan, assumptions);
    const summary = summarizePlan(transitionPlan, result);
    expect(summary.planId).toBe("planA");
    expect(summary.electricVehiclesAtEnd).toBe(1);
    expect(summary.peakPowerKW).toBe(22);
  });
});

describe("optimizeTransitionPlan", () => {
  it("is deterministic, selects positive-value vehicles, and respects capacity", () => {
    const input = plan([
      vehicle("v1", 60000, null),
      vehicle("v2", 50000, null),
      vehicle("v3", 40000, null),
      vehicle("v4", 1000, 2027),
    ]);
    const first = optimizeTransitionPlan(input, assumptions);
    const second = optimizeTransitionPlan(input, assumptions);
    expect(first.transitionedVehicleIds).toEqual(second.transitionedVehicleIds);
    expect(first.transitionedVehicleIds).toEqual(["v1", "v2"]);
    expect(first.plan.vehicles.filter((item) => item.transitionYear !== null)).toHaveLength(2);
    const result = calculateTransitionPlan(first.plan, assumptions);
    expect(result.peakPowerKW).toBeLessThanOrEqual(assumptions.sitePowerCapacityKW);
    expect(result.overloadedYears).toEqual([]);
  });
});
