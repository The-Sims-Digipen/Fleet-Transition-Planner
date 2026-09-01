export type Powertrain = "diesel" | "electric";
export type PlanId = "planA" | "planB";
export type PaybackBand = "fast" | "moderate" | "long" | "not-viable";
export type ComparisonMetric = "cost" | "emissions" | "power";

export interface DepotPosition {
  x: number;
  z: number;
}

export interface Vehicle {
  id: string;
  registration: string;
  category: string;
  annualDistanceKm: number;
  currentAgeYears: number;
  transitionYear: number | null;
  parkingPosition: DepotPosition;
}

export interface Assumptions {
  dieselPricePerLitre: number;
  electricityPricePerKWh: number;
  dieselLitresPer100Km: number;
  electricKWhPer100Km: number;
  dieselKgCO2PerLitre: number;
  gridKgCO2PerKWh: number;
  electricVehiclePurchaseCost: number;
  chargerCost: number;
  chargerPowerKW: number;
  sitePowerCapacityKW: number;
  startYear: number;
  endYear: number;
}

export interface TransitionPlan {
  id: PlanId;
  name: string;
  vehicles: Vehicle[];
}

export interface PlannerWorkspace {
  assumptions: Assumptions;
  plans: Record<PlanId, TransitionPlan>;
}

/** Kept for callers that still need a self-contained scenario value. */
export interface Scenario extends TransitionPlan {
  assumptions: Assumptions;
}

export interface VehicleEconomics {
  annualDieselCost: number;
  annualElectricCost: number;
  annualSavings: number;
  annualDieselEmissionsKgCO2: number;
  annualElectricEmissionsKgCO2: number;
  annualEmissionsAvoidedKgCO2: number;
  paybackYears: number | null;
  paybackBand: PaybackBand;
  horizonSavings: number;
}

export interface YearResult {
  year: number;
  electricVehicles: number;
  dieselVehicles: number;
  chargersRequired: number;
  annualDieselEnergyCost: number;
  annualElectricEnergyCost: number;
  annualEnergyCost: number;
  annualCapitalCost: number;
  annualTotalCost: number;
  annualSavingsVsBaseline: number;
  cumulativeCost: number;
  cumulativeCapitalCost: number;
  cumulativeBaselineCost: number;
  cumulativeSavingsVsBaseline: number;
  dieselBaselineAnnualCost: number;
  annualEmissionsKgCO2: number;
  annualEmissionsAvoidedKgCO2: number;
  cumulativeEmissionsKgCO2: number;
  cumulativeEmissionsAvoidedKgCO2: number;
  peakPowerKW: number;
  exceedsSiteCapacity: boolean;
}

export interface TransitionPlanResult {
  years: YearResult[];
  paybackYear: number | null;
  totalCapitalCost: number;
  totalEnergyCost: number;
  totalCost: number;
  baselineCost: number;
  netSavings: number;
  totalEmissionsKgCO2: number;
  emissionsAvoidedKgCO2: number;
  peakPowerKW: number;
  overloadedYears: number[];
}

export interface PlanSummary {
  planId: PlanId;
  planName: string;
  cumulativeCost: number;
  capitalCost: number;
  operatingCost: number;
  savingsVsBaseline: number;
  paybackYear: number | null;
  cumulativeEmissionsKgCO2: number;
  emissionsAvoidedKgCO2: number;
  peakPowerKW: number;
  overloadedYears: number[];
  electricVehiclesAtEnd: number;
}

export interface OptimizationResult {
  plan: TransitionPlan;
  transitionedVehicleIds: string[];
  retainedVehicleIds: string[];
  capacitySlots: number;
}
