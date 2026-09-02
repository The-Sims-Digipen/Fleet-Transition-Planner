import { useMemo, useState } from "react";
import { calculateVehicleEconomics, getDepotVehicleCohort } from "../domain/fleet";
import type { PaybackBand, Vehicle } from "../domain/fleet";
import { usePlannerStore } from "../store/plannerStore";
import { formatPayback, money, wholeNumber } from "../utils/format";
import { PlanSwitch } from "./PlanSwitch";

type StatusFilter = "all" | "planned" | "diesel";
type SortOrder = "distance" | "payback" | "transition";

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
  const selectedVehicleId = usePlannerStore((state) => state.selectedVehicleId);
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

  const depotVehicles = useMemo(
    () => getDepotVehicleCohort(plan.vehicles, selectedVehicleId),
    [plan.vehicles, selectedVehicleId],
  );
  const selected = new Set(selectedVehicleIds);
  const allDepotVehiclesSelected = depotVehicles.length > 0 &&
    depotVehicles.every((vehicle) => selected.has(vehicle.id));
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
  const bayNumbers = useMemo(
    () => new Map(plan.vehicles.map((vehicle, index) => [vehicle.id, index + 1])),
    [plan.vehicles],
  );

  function toggleDepotSelection() {
    const depotIds = new Set(depotVehicles.map((vehicle) => vehicle.id));
    setSelectedVehicleIds(
      allDepotVehiclesSelected
        ? selectedVehicleIds.filter((id) => !depotIds.has(id))
        : [...new Set([...selectedVehicleIds, ...depotIds])],
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
          <span className="fleet-match-count" role="status">{filteredVehicles.length} fleet {filteredVehicles.length === 1 ? "match" : "matches"}</span>
          <button
            className="secondary-button compact-button"
            type="button"
            disabled={filteredVehicles.length === 0}
            onClick={() => setSelectedVehicleId(filteredVehicles[0]?.id ?? null)}
          >
            Show top match in depot
          </button>
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

      <section className="panel-card fleet-entity-card" aria-labelledby="fleet-results-title">
        <div className="fleet-results-heading">
          <div>
            <p className="eyebrow">Entity hierarchy</p>
            <h3 id="fleet-results-title">Depot entities</h3>
            <p>The same six vehicles currently rendered in the 3D depot</p>
          </div>
          <div className="entity-heading-actions">
            <span className="entity-viewport-count">Scene synchronized</span>
            <label className="select-all-control"><input type="checkbox" checked={allDepotVehiclesSelected} onChange={toggleDepotSelection} /> Select all 6</label>
          </div>
        </div>
        <p id="entity-scroll-help" className="sr-only">This entity hierarchy contains the same six vehicles displayed in the 3D depot.</p>
        <ul
          className="fleet-entity-scroll"
          aria-label="Depot entities"
          aria-describedby="entity-scroll-help"
          data-visible-rows="6"
          tabIndex={0}
        >
          {depotVehicles.map((vehicle) => (
            <VehicleEntityRow
              key={vehicle.id}
              vehicle={vehicle}
              bayNumber={bayNumbers.get(vehicle.id) ?? 0}
              selected={selected.has(vehicle.id)}
              inspected={selectedVehicleId === vehicle.id}
              economics={economics.get(vehicle.id)!}
              years={years}
              onToggle={() => toggleVehicleSelected(vehicle.id)}
              onInspect={() => setSelectedVehicleId(vehicle.id)}
              onTransition={(transitionYear) => setVehicleTransitionYear(vehicle.id, transitionYear)}
            />
          ))}
        </ul>
        <div className="entity-inspector-footer" aria-hidden="true">
          <span>Current depot cohort</span>
          <span>{depotVehicles.length} entities</span>
        </div>
      </section>
    </div>
  );
}

function VehicleEntityRow({ vehicle, bayNumber, selected, inspected, economics, years, onToggle, onInspect, onTransition }: {
  vehicle: Vehicle;
  bayNumber: number;
  selected: boolean;
  inspected: boolean;
  economics: ReturnType<typeof calculateVehicleEconomics>;
  years: number[];
  onToggle: () => void;
  onInspect: () => void;
  onTransition: (year: number | null) => void;
}) {
  return (
    <li className={`fleet-entity-row${selected ? " is-selected" : ""}${inspected ? " is-inspected" : ""}`}>
      <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Select ${vehicle.registration}`} />
      <button className="entity-identity" type="button" onClick={onInspect} aria-label={vehicle.registration} aria-current={inspected ? "true" : undefined}>
        <div className="entity-title-line">
          <strong className="entity-registration">{vehicle.registration}</strong>
          <span className={vehicle.transitionYear === null ? "entity-status is-diesel" : "entity-status is-planned"}>{vehicle.transitionYear === null ? "Diesel" : `EV ${vehicle.transitionYear}`}</span>
        </div>
        <span>{vehicle.category} · Bay {String(bayNumber).padStart(2, "0")}</span>
        <div className="entity-metrics">
          <span>{wholeNumber.format(vehicle.annualDistanceKm)} km</span>
          <span>{vehicle.currentAgeYears} {vehicle.currentAgeYears === 1 ? "yr" : "yrs"}</span>
          <span className={economics.annualSavings >= 0 ? "positive-text" : "danger-text"}>{money.format(economics.annualSavings)}/yr</span>
          <span className={`roi-label roi-${economics.paybackBand}`}>{formatPayback(economics.paybackYears)}</span>
        </div>
      </button>
      <label className="entity-transition-control">
        <span>Transition</span>
        <select className="field-control row-select" aria-label={`${vehicle.registration} transition year`} value={vehicle.transitionYear ?? ""} onChange={(event) => onTransition(event.target.value === "" ? null : Number(event.target.value))}><option value="">Retain diesel</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select>
      </label>
    </li>
  );
}
