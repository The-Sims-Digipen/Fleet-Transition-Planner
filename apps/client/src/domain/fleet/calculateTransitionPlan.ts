import type {
  Assumptions,
  OptimizationResult,
  PaybackBand,
  PlanSummary,
  TransitionPlan,
  TransitionPlanResult,
  Vehicle,
  VehicleEconomics,
  YearResult,
} from "./types.js";

function energyUse(vehicle: Vehicle, per100Km: number): number {
  return (vehicle.annualDistanceKm / 100) * per100Km;
}

export function operatingCostForVehicle(
  vehicle: Vehicle,
  isElectric: boolean,
  assumptions: Assumptions,
): number {
  return isElectric
    ? energyUse(vehicle, assumptions.electricKWhPer100Km) *
        assumptions.electricityPricePerKWh
    : energyUse(vehicle, assumptions.dieselLitresPer100Km) *
        assumptions.dieselPricePerLitre;
}

export function emissionsForVehicle(
  vehicle: Vehicle,
  isElectric: boolean,
  assumptions: Assumptions,
): number {
  return isElectric
    ? energyUse(vehicle, assumptions.electricKWhPer100Km) *
        assumptions.gridKgCO2PerKWh
    : energyUse(vehicle, assumptions.dieselLitresPer100Km) *
        assumptions.dieselKgCO2PerLitre;
}

function getPaybackBand(paybackYears: number | null): PaybackBand {
  if (paybackYears === null) return "not-viable";
  if (paybackYears < 4) return "fast";
  if (paybackYears <= 7) return "moderate";
  return "long";
}

export function calculateVehicleEconomics(
  vehicle: Vehicle,
  assumptions: Assumptions,
): VehicleEconomics {
  const annualDieselCost = operatingCostForVehicle(vehicle, false, assumptions);
  const annualElectricCost = operatingCostForVehicle(vehicle, true, assumptions);
  const annualSavings = annualDieselCost - annualElectricCost;
  const annualDieselEmissionsKgCO2 = emissionsForVehicle(
    vehicle,
    false,
    assumptions,
  );
  const annualElectricEmissionsKgCO2 = emissionsForVehicle(
    vehicle,
    true,
    assumptions,
  );
  const transitionCost =
    assumptions.electricVehiclePurchaseCost + assumptions.chargerCost;
  const paybackYears = annualSavings > 0 ? transitionCost / annualSavings : null;
  const horizonYears = assumptions.endYear - assumptions.startYear + 1;

  return {
    annualDieselCost,
    annualElectricCost,
    annualSavings,
    annualDieselEmissionsKgCO2,
    annualElectricEmissionsKgCO2,
    annualEmissionsAvoidedKgCO2:
      annualDieselEmissionsKgCO2 - annualElectricEmissionsKgCO2,
    paybackYears,
    paybackBand: getPaybackBand(paybackYears),
    horizonSavings: annualSavings * horizonYears - transitionCost,
  };
}

function baselineTotals(vehicles: Vehicle[], assumptions: Assumptions) {
  return vehicles.reduce(
    (totals, vehicle) => ({
      cost:
        totals.cost + operatingCostForVehicle(vehicle, false, assumptions),
      emissions:
        totals.emissions + emissionsForVehicle(vehicle, false, assumptions),
    }),
    { cost: 0, emissions: 0 },
  );
}

/**
 * One EV and charger are purchased per transition. Chargers remain installed,
 * and an all-diesel fleet is the comparison baseline.
 */
export function calculateTransitionPlan(
  plan: TransitionPlan,
  assumptions: Assumptions,
): TransitionPlanResult {
  const years: YearResult[] = [];
  const baseline = baselineTotals(plan.vehicles, assumptions);
  const firstTransitionYear = plan.vehicles.reduce<number | null>(
    (earliest, vehicle) => {
      if (vehicle.transitionYear === null) return earliest;
      return earliest === null
        ? vehicle.transitionYear
        : Math.min(earliest, vehicle.transitionYear);
    },
    null,
  );

  let cumulativeCost = 0;
  let cumulativeCapitalCost = 0;
  let cumulativeEnergyCost = 0;
  let cumulativeEmissions = 0;
  let cumulativeEmissionsAvoided = 0;
  let baselineCumulativeCost = 0;
  let paybackYear: number | null = null;

  for (
    let year = assumptions.startYear;
    year <= assumptions.endYear;
    year += 1
  ) {
    let electricVehicles = 0;
    let annualDieselEnergyCost = 0;
    let annualElectricEnergyCost = 0;
    let annualEmissionsKgCO2 = 0;
    let annualBaselineEmissionsKgCO2 = 0;
    let transitioningThisYear = 0;

    for (const vehicle of plan.vehicles) {
      const isElectric =
        vehicle.transitionYear !== null && vehicle.transitionYear <= year;
      if (isElectric) electricVehicles += 1;
      if (vehicle.transitionYear === year) transitioningThisYear += 1;

      const vehicleCost = operatingCostForVehicle(
        vehicle,
        isElectric,
        assumptions,
      );
      if (isElectric) annualElectricEnergyCost += vehicleCost;
      else annualDieselEnergyCost += vehicleCost;

      annualEmissionsKgCO2 += emissionsForVehicle(
        vehicle,
        isElectric,
        assumptions,
      );
      annualBaselineEmissionsKgCO2 += emissionsForVehicle(
        vehicle,
        false,
        assumptions,
      );
    }

    const annualEnergyCost =
      annualDieselEnergyCost + annualElectricEnergyCost;
    const annualCapitalCost =
      transitioningThisYear *
      (assumptions.electricVehiclePurchaseCost + assumptions.chargerCost);
    const annualTotalCost = annualEnergyCost + annualCapitalCost;
    const annualEmissionsAvoidedKgCO2 =
      annualBaselineEmissionsKgCO2 - annualEmissionsKgCO2;

    cumulativeEnergyCost += annualEnergyCost;
    cumulativeCapitalCost += annualCapitalCost;
    cumulativeCost += annualTotalCost;
    cumulativeEmissions += annualEmissionsKgCO2;
    cumulativeEmissionsAvoided += annualEmissionsAvoidedKgCO2;
    baselineCumulativeCost += baseline.cost;

    if (
      paybackYear === null &&
      firstTransitionYear !== null &&
      year >= firstTransitionYear &&
      baselineCumulativeCost >= cumulativeCost
    ) {
      paybackYear = year;
    }

    const chargersRequired = electricVehicles;
    const peakPowerKW = chargersRequired * assumptions.chargerPowerKW;

    years.push({
      year,
      electricVehicles,
      dieselVehicles: plan.vehicles.length - electricVehicles,
      chargersRequired,
      annualDieselEnergyCost,
      annualElectricEnergyCost,
      annualEnergyCost,
      annualCapitalCost,
      annualTotalCost,
      annualSavingsVsBaseline: baseline.cost - annualEnergyCost,
      cumulativeCost,
      cumulativeCapitalCost,
      cumulativeBaselineCost: baselineCumulativeCost,
      cumulativeSavingsVsBaseline: baselineCumulativeCost - cumulativeCost,
      dieselBaselineAnnualCost: baseline.cost,
      annualEmissionsKgCO2,
      annualEmissionsAvoidedKgCO2,
      cumulativeEmissionsKgCO2: cumulativeEmissions,
      cumulativeEmissionsAvoidedKgCO2: cumulativeEmissionsAvoided,
      peakPowerKW,
      exceedsSiteCapacity: peakPowerKW > assumptions.sitePowerCapacityKW,
    });
  }

  return {
    years,
    paybackYear,
    totalCapitalCost: cumulativeCapitalCost,
    totalEnergyCost: cumulativeEnergyCost,
    totalCost: cumulativeCost,
    baselineCost: baselineCumulativeCost,
    netSavings: baselineCumulativeCost - cumulativeCost,
    totalEmissionsKgCO2: cumulativeEmissions,
    emissionsAvoidedKgCO2: cumulativeEmissionsAvoided,
    peakPowerKW: Math.max(0, ...years.map((item) => item.peakPowerKW)),
    overloadedYears: years
      .filter((item) => item.exceedsSiteCapacity)
      .map((item) => item.year),
  };
}

export function summarizePlan(
  plan: TransitionPlan,
  result: TransitionPlanResult,
): PlanSummary {
  return {
    planId: plan.id,
    planName: plan.name,
    cumulativeCost: result.totalCost,
    capitalCost: result.totalCapitalCost,
    operatingCost: result.totalEnergyCost,
    savingsVsBaseline: result.netSavings,
    paybackYear: result.paybackYear,
    cumulativeEmissionsKgCO2: result.totalEmissionsKgCO2,
    emissionsAvoidedKgCO2: result.emissionsAvoidedKgCO2,
    peakPowerKW: result.peakPowerKW,
    overloadedYears: result.overloadedYears,
    electricVehiclesAtEnd: result.years.at(-1)?.electricVehicles ?? 0,
  };
}

export function optimizeTransitionPlan(
  plan: TransitionPlan,
  assumptions: Assumptions,
): OptimizationResult {
  const capacitySlots =
    assumptions.chargerPowerKW > 0
      ? Math.max(
          0,
          Math.floor(
            assumptions.sitePowerCapacityKW / assumptions.chargerPowerKW,
          ),
        )
      : 0;

  const ranked = plan.vehicles
    .map((vehicle) => ({
      vehicle,
      economics: calculateVehicleEconomics(vehicle, assumptions),
    }))
    .filter(
      ({ economics }) =>
        economics.annualSavings > 0 && economics.horizonSavings > 0,
    )
    .sort((a, b) => {
      if (b.economics.horizonSavings !== a.economics.horizonSavings) {
        return b.economics.horizonSavings - a.economics.horizonSavings;
      }
      if (a.economics.paybackYears !== b.economics.paybackYears) {
        return (a.economics.paybackYears ?? Infinity) -
          (b.economics.paybackYears ?? Infinity);
      }
      if (b.vehicle.currentAgeYears !== a.vehicle.currentAgeYears) {
        return b.vehicle.currentAgeYears - a.vehicle.currentAgeYears;
      }
      return a.vehicle.id.localeCompare(b.vehicle.id);
    });

  const transitionedVehicleIds = ranked
    .slice(0, capacitySlots)
    .map(({ vehicle }) => vehicle.id);
  const transitioned = new Set(transitionedVehicleIds);
  const retainedVehicleIds = plan.vehicles
    .filter((vehicle) => !transitioned.has(vehicle.id))
    .map((vehicle) => vehicle.id);

  return {
    capacitySlots,
    transitionedVehicleIds,
    retainedVehicleIds,
    plan: {
      ...plan,
      vehicles: plan.vehicles.map((vehicle) => ({
        ...vehicle,
        transitionYear: transitioned.has(vehicle.id)
          ? assumptions.startYear
          : null,
      })),
    },
  };
}
