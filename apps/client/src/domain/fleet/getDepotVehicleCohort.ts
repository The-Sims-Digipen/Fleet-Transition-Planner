export const DEPOT_VEHICLE_COHORT_SIZE = 6;

export function getDepotVehicleCohort<T extends { id: string }>(
  vehicles: readonly T[],
  selectedVehicleId: string | null,
): T[] {
  const selectedIndex = selectedVehicleId
    ? vehicles.findIndex((vehicle) => vehicle.id === selectedVehicleId)
    : -1;
  const desiredStart = selectedIndex >= 0
    ? Math.floor(selectedIndex / DEPOT_VEHICLE_COHORT_SIZE) * DEPOT_VEHICLE_COHORT_SIZE
    : 0;
  const start = Math.min(
    desiredStart,
    Math.max(0, vehicles.length - DEPOT_VEHICLE_COHORT_SIZE),
  );

  return vehicles.slice(start, start + DEPOT_VEHICLE_COHORT_SIZE);
}
