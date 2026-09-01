export type Powertrain = "diesel" | "electric";

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

export interface Scenario {
  id: string;
  name: string;
  vehicles: Vehicle[];
  assumptions: Assumptions;
}

export interface YearResult {
  year: number;

  electricVehicles: number;
  dieselVehicles: number;
  chargersRequired: number;

  annualEnergyCost: number;
  annualCapitalCost: number;
  annualTotalCost: number;
  cumulativeCost: number;

  annualEmissionsKgCO2: number;
  cumulativeEmissionsKgCO2: number;

  peakPowerKW: number;
  exceedsSiteCapacity: boolean;
}

export interface TransitionPlanResult {
  years: YearResult[];
  paybackYear: number | null;
}
