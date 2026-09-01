import { useEffect, useMemo, useState } from "react";
import { calculateVehicleEconomics } from "../domain/fleet";
import type { PaybackBand, Vehicle } from "../domain/fleet";
import { usePlannerStore } from "../store/plannerStore";
import { formatPayback, money, wholeNumber } from "../utils/format";
import { PlanSwitch } from "./PlanSwitch";

type StatusFilter = "all" | "planned" | "diesel";
type SortOrder = "distance" | "payback" | "transition";

const PAGE_SIZE = 25;
const bandLabels: Record<PaybackBand, string> = {
  fast: "Fast payback",
  moderate: "Moderate",
  long: "Long payback",
  "not-viable": "Not viable",
};

export function FleetPlanner() {
  const activePlanId = usePlannerStore((state) => state.activePlanId);
  const plan = usePlannerStore((state) => state.workspace.plans[activePlanId]);
  const assumptions = usePlannerStore((state) => state.workspace.assumptions);
  const selectedVehicleIds = usePlannerStore((state) => state.selectedVehicleIds);
  const setSelectedVehicleIds = usePlannerStore((state) => state.setSelectedVehicleIds);
  const toggleVehicleSelected = usePlannerStore((state) => state.toggleVehicleSelected);
  const setSelectedVehicleId = usePlannerStore((state) => state.setSelectedVehicleId);
  const setVehicleTransitionYear = usePlannerStore((state) => state.setVehicleTransitionYear);
  const setVehiclesTransitionYear = usePlannerStore((state) => state.setVehiclesTransitionYear);
  const optimizeActivePlan = usePlannerStore((state) => state.optimizeActivePlan);
  const undoOptimization = usePlannerStore((state) => state.undoOptimization);
  const optimizationNotice = usePlannerStore((state) => state.optimizationNotice);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("distance");
  const [page, setPage] = useState(1);
  const [bulkYear, setBulkYear] = useState(String(assumptions.startYear));

  const economics = useMemo(
    () => new Map(plan.vehicles.map((vehicle) => [
      vehicle.id,
      calculateVehicleEconomics(vehicle, assumptions),
    ])),
    [plan.vehicles, assumptions],
  );
  const categories = useMemo(
    () => [...new Set(plan.vehicles.map((vehicle) => vehicle.category))].sort(),
    [plan.vehicles],
  );

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLowerCase();
    return plan.vehicles
      .filter((vehicle) =>
        (!query || `${vehicle.registration} ${vehicle.category}`.toLowerCase().includes(query)) &&
        (category === "all" || vehicle.category === category) &&
        (status === "all" ||
          (status === "planned" && vehicle.transitionYear !== null) ||
          (status === "diesel" && vehicle.transitionYear === null)),
      )
      .sort((a, b) => {
        if (sortOrder === "distance") return b.annualDistanceKm - a.annualDistanceKm;
        if (sortOrder === "payback") {
          return (economics.get(a.id)?.paybackYears ?? Infinity) -
            (economics.get(b.id)?.paybackYears ?? Infinity);
        }
        return (a.transitionYear ?? Infinity) - (b.transitionYear ?? Infinity);
      });
  }, [category, economics, plan.vehicles, search, sortOrder, status]);

  useEffect(() => setPage(1), [search, category, status, sortOrder, activePlanId]);

  const pageCount = Math.max(1, Math.ceil(filteredVehicles.length / PAGE_SIZE));
  const visibleVehicles = filteredVehicles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = new Set(selectedVehicleIds);
  const allFilteredSelected = filteredVehicles.length > 0 &&
    filteredVehicles.every((vehicle) => selected.has(vehicle.id));
  const years = Array.from(
    { length: assumptions.endYear - assumptions.startYear + 1 },
    (_, index) => assumptions.startYear + index,
  );
  const bandCounts = plan.vehicles.reduce<Record<PaybackBand, number>>(
    (counts, vehicle) => {
      const band = economics.get(vehicle.id)?.paybackBand ?? "not-viable";
      counts[band] += 1;
      return counts;
    },
    { fast: 0, moderate: 0, long: 0, "not-viable": 0 },
  );

  function toggleFilteredSelection() {
    const filteredIds = new Set(filteredVehicles.map((vehicle) => vehicle.id));
    setSelectedVehicleIds(
      allFilteredSelected
        ? selectedVehicleIds.filter((id) => !filteredIds.has(id))
        : [...new Set([...selectedVehicleIds, ...filteredIds])],
    );
  }

  function toggleCategorySelection(categoryName: string) {
    const ids = plan.vehicles.filter((vehicle) => vehicle.category === categoryName).map((vehicle) => vehicle.id);
    const allSelected = ids.every((id) => selected.has(id));
    const categoryIds = new Set(ids);
    setSelectedVehicleIds(
      allSelected
        ? selectedVehicleIds.filter((id) => !categoryIds.has(id))
        : [...new Set([...selectedVehicleIds, ...ids])],
    );
  }

  return (
    <div className="workspace-stack">
      <div className="workspace-intro">
        <div>
          <p className="eyebrow">100-vehicle fleet</p>
          <h2>Vehicle transition planner</h2>
          <p>Filter, inspect, and schedule individual vehicles or whole categories.</p>
        </div>
        <div className="planner-header-actions">
          <PlanSwitch />
          <button className="primary-button" type="button" onClick={optimizeActivePlan}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m13 2-9 12h8l-1 8 9-12h-8l1-8Z" /></svg>
            Optimize active plan
          </button>
        </div>
      </div>

      {optimizationNotice && optimizationNotice.planId === activePlanId && (
        <div className="success-banner" role="status" aria-live="polite">
          <span>Optimized {optimizationNotice.transitionedCount} vehicles; {optimizationNotice.retainedCount} remain diesel under the current ROI and capacity limits.</span>
          <button type="button" onClick={undoOptimization}>Undo optimization</button>
        </div>
      )}

      <section className="panel-card fleet-toolbar" aria-label="Fleet filters and category selection">
        <div className="filter-grid">
          <label className="field-label" htmlFor="fleet-search"><span>Search fleet</span><input id="fleet-search" className="field-control" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Registration or category" /></label>
          <label className="field-label" htmlFor="category-filter"><span>Category</span><select id="category-filter" className="field-control" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <label className="field-label" htmlFor="status-filter"><span>Transition status</span><select id="status-filter" className="field-control" value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}><option value="all">All statuses</option><option value="planned">Transition planned</option><option value="diesel">Retain diesel</option></select></label>
          <label className="field-label" htmlFor="sort-order"><span>Sort by</span><select id="sort-order" className="field-control" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}><option value="distance">Highest distance</option><option value="payback">Shortest payback</option><option value="transition">Earliest transition</option></select></label>
        </div>
        <div className="category-actions" aria-label="Select a vehicle category">
          {categories.map((item) => {
            const ids = plan.vehicles.filter((vehicle) => vehicle.category === item).map((vehicle) => vehicle.id);
            const isSelected = ids.every((id) => selected.has(id));
            return <button key={item} type="button" className={isSelected ? "filter-chip is-active" : "filter-chip"} aria-pressed={isSelected} onClick={() => toggleCategorySelection(item)}>Select {item} ({ids.length})</button>;
          })}
        </div>
      </section>

      <div className="roi-summary" aria-label="Fleet payback summary">
        {(Object.keys(bandLabels) as PaybackBand[]).map((band) => (
          <span key={band} className={`roi-pill roi-${band}`}><strong>{bandCounts[band]}</strong> {bandLabels[band]}</span>
        ))}
      </div>

      {selectedVehicleIds.length > 0 && (
        <div className="bulk-action-bar">
          <strong>{selectedVehicleIds.length} selected</strong>
          <label htmlFor="bulk-transition-year">Set transition</label>
          <select id="bulk-transition-year" className="field-control" value={bulkYear} onChange={(event) => setBulkYear(event.target.value)}>
            <option value="">Retain diesel</option>
            {years.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <button className="primary-button" type="button" onClick={() => setVehiclesTransitionYear(selectedVehicleIds, bulkYear === "" ? null : Number(bulkYear))}>Apply to selection</button>
          <button className="secondary-button" type="button" onClick={() => setSelectedVehicleIds([])}>Clear</button>
        </div>
      )}

      <section className="panel-card fleet-table-card" aria-labelledby="fleet-results-title">
        <div className="fleet-results-heading">
          <div>
            <h3 id="fleet-results-title">Fleet results</h3>
            <p>
              {filteredVehicles.length} {filteredVehicles.length === 1 ? "vehicle matches" : "vehicles match"} the current filters
            </p>
          </div>
          <label className="select-all-control"><input type="checkbox" checked={allFilteredSelected} onChange={toggleFilteredSelection} /> Select all filtered</label>
        </div>
        <div className="table-scroll">
          <table className="fleet-table">
            <thead><tr><th className="checkbox-cell"><span className="sr-only">Select</span></th><th>Vehicle</th><th>Usage</th><th>Economics</th><th>Transition</th></tr></thead>
            <tbody>
              {visibleVehicles.map((vehicle) => (
                <VehicleRow
                  key={vehicle.id}
                  vehicle={vehicle}
                  selected={selected.has(vehicle.id)}
                  economics={economics.get(vehicle.id)!}
                  years={years}
                  onToggle={() => toggleVehicleSelected(vehicle.id)}
                  onInspect={() => setSelectedVehicleId(vehicle.id)}
                  onTransition={(transitionYear) => setVehicleTransitionYear(vehicle.id, transitionYear)}
                />
              ))}
            </tbody>
          </table>
        </div>
        {filteredVehicles.length === 0 && <div className="empty-state">No vehicles match these filters.</div>}
        <div className="pagination" aria-label="Fleet pages">
          <button type="button" className="secondary-button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <span>Page {page} of {pageCount}</span>
          <button type="button" className="secondary-button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Next</button>
        </div>
      </section>
    </div>
  );
}

function VehicleRow({ vehicle, selected, economics, years, onToggle, onInspect, onTransition }: {
  vehicle: Vehicle;
  selected: boolean;
  economics: ReturnType<typeof calculateVehicleEconomics>;
  years: number[];
  onToggle: () => void;
  onInspect: () => void;
  onTransition: (year: number | null) => void;
}) {
  return (
    <tr className={selected ? "is-selected" : ""}>
      <td className="checkbox-cell"><input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Select ${vehicle.registration}`} /></td>
      <td><button className="vehicle-link" type="button" onClick={onInspect}>{vehicle.registration}</button><span>{vehicle.category}</span></td>
      <td>
        <strong>{wholeNumber.format(vehicle.annualDistanceKm)} km</strong>
        <span>{vehicle.currentAgeYears} {vehicle.currentAgeYears === 1 ? "year" : "years"} old</span>
      </td>
      <td><strong className={economics.annualSavings >= 0 ? "positive-text" : "danger-text"}>{money.format(economics.annualSavings)}/yr</strong><span className={`roi-label roi-${economics.paybackBand}`}>{formatPayback(economics.paybackYears)}</span></td>
      <td><select className="field-control row-select" aria-label={`${vehicle.registration} transition year`} value={vehicle.transitionYear ?? ""} onChange={(event) => onTransition(event.target.value === "" ? null : Number(event.target.value))}><option value="">Retain diesel</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></td>
    </tr>
  );
}
