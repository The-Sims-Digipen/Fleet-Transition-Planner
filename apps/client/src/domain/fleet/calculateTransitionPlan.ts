import type {
  Assumptions,
  Scenario,
  TransitionPlanResult,
  Vehicle,
  YearResult,
} from "./types.js";

function operatingCostForVehicle(
  vehicle: Vehicle,
  isElectric: boolean,
  assumptions: Assumptions,
): number {
  if (isElectric) {
    const kWh =
      (vehicle.annualDistanceKm / 100) * assumptions.electricKWhPer100Km;
    return kWh * assumptions.electricityPricePerKWh;
  }

  const litres =
    (vehicle.annualDistanceKm / 100) * assumptions.dieselLitresPer100Km;
  return litres * assumptions.dieselPricePerLitre;
}

function emissionsForVehicle(
  vehicle: Vehicle,
  isElectric: boolean,
  assumptions: Assumptions,
): number {
  if (isElectric) {
    const kWh =
      (vehicle.annualDistanceKm / 100) * assumptions.electricKWhPer100Km;
    return kWh * assumptions.gridKgCO2PerKWh;
  }

  const litres =
    (vehicle.annualDistanceKm / 100) * assumptions.dieselLitresPer100Km;
  return litres * assumptions.dieselKgCO2PerLitre;
}

function dieselBaselineAnnualCost(
  vehicles: Vehicle[],
  assumptions: Assumptions,
): number {
  return vehicles.reduce(
    (total, vehicle) =>
      total + operatingCostForVehicle(vehicle, false, assumptions),
    0,
  );
}

/**
 * Starter model only.
 *
 * Assumptions deliberately remain simple:
 * - each EV transition buys one EV;
 * - each EV requires one charger;
 * - peak power is EV count * charger power;
 * - capital expenditure is charged in the transition year;
 * - baseline comparison assumes all vehicles remain diesel.
 *
 * Replace these rules when the partner provides the real domain model.
 */
export function calculateTransitionPlan(
  scenario: Scenario,
): TransitionPlanResult {
  const { vehicles, assumptions } = scenario;
  const years: YearResult[] = [];

  let cumulativeCost = 0;
  let cumulativeEmissions = 0;
  let baselineCumulativeCost = 0;
  let paybackYear: number | null = null;

  const baselineAnnualCost = dieselBaselineAnnualCost(vehicles, assumptions);

  for (
    let year = assumptions.startYear;
    year <= assumptions.endYear;
    year += 1
  ) {
    const electricVehicles = vehicles.filter(
      (vehicle) =>
        vehicle.transitionYear !== null && vehicle.transitionYear <= year,
    );

    const dieselVehicles = vehicles.length - electricVehicles.length;

    const annualEnergyCost = vehicles.reduce((total, vehicle) => {
      const isElectric =
        vehicle.transitionYear !== null && vehicle.transitionYear <= year;

      return total + operatingCostForVehicle(vehicle, isElectric, assumptions);
    }, 0);

    const transitioningThisYear = vehicles.filter(
      (vehicle) => vehicle.transitionYear === year,
    ).length;

    const annualCapitalCost =
      transitioningThisYear *
      (assumptions.electricVehiclePurchaseCost + assumptions.chargerCost);

    const annualTotalCost = annualEnergyCost + annualCapitalCost;

    const annualEmissionsKgCO2 = vehicles.reduce((total, vehicle) => {
      const isElectric =
        vehicle.transitionYear !== null && vehicle.transitionYear <= year;

      return total + emissionsForVehicle(vehicle, isElectric, assumptions);
    }, 0);

    cumulativeCost += annualTotalCost;
    cumulativeEmissions += annualEmissionsKgCO2;
    baselineCumulativeCost += baselineAnnualCost;

    if (paybackYear === null && cumulativeCost <= baselineCumulativeCost) {
      paybackYear = year;
    }

    const chargersRequired = electricVehicles.length;
    const peakPowerKW = chargersRequired * assumptions.chargerPowerKW;

    years.push({
      year,
      electricVehicles: electricVehicles.length,
      dieselVehicles,
      chargersRequired,
      annualEnergyCost,
      annualCapitalCost,
      annualTotalCost,
      cumulativeCost,
      annualEmissionsKgCO2,
      cumulativeEmissionsKgCO2: cumulativeEmissions,
      peakPowerKW,
      exceedsSiteCapacity: peakPowerKW > assumptions.sitePowerCapacityKW,
    });
  }

  return {
    years,
    paybackYear,
  };
}
