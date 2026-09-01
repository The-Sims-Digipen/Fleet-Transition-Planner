import { lazy, Suspense, useMemo, useState } from "react";
import { calculateTransitionPlan } from "./domain/fleet";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { FleetPlanner } from "./components/FleetPlanner";
import { OverviewPanel } from "./components/OverviewPanel";
import { VehicleInspector } from "./components/VehicleInspector";
import { usePlannerStore } from "./store/plannerStore";

const LazyDepotScene = lazy(() => import("./components/DepotScene").then((module) => ({ default: module.DepotScene })));

type WorkspaceTab = "overview" | "fleet" | "compare";
const tabs: Array<{ id: WorkspaceTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "fleet", label: "Fleet Planner" },
  { id: "compare", label: "Compare Plans" },
];

export default function App() {
  const workspace = usePlannerStore((state) => state.workspace);
  const activePlanId = usePlannerStore((state) => state.activePlanId);
  const selectedYear = usePlannerStore((state) => state.selectedYear);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const activePlan = workspace.plans[activePlanId];
  const result = useMemo(
    () => calculateTransitionPlan(activePlan, workspace.assumptions),
    [activePlan, workspace.assumptions],
  );
  const yearResult = result.years.find((item) => item.year === selectedYear) ?? result.years[0];

  return (
    <main className="app-shell">
      <a className="skip-link" href="#workspace-content">Skip to planning workspace</a>
      <header className="app-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m4 7 8-4 8 4-8 4-8-4Z" /><path d="m4 12 8 4 8-4M4 17l8 4 8-4" /></svg>
          </span>
          <div><p>Digital twin decision platform</p><h1>Fleet Transition Planner</h1></div>
        </div>
        <div className="header-status" aria-label="Current workspace state">
          <span>{activePlan.name}</span><strong>{selectedYear}</strong>
          <i className={yearResult.exceedsSiteCapacity ? "status-dot is-danger" : "status-dot"} aria-hidden="true" />
          <span>{yearResult.exceedsSiteCapacity ? "Capacity exceeded" : "Grid normal"}</span>
        </div>
      </header>

      <div className="split-workspace">
        <section className="depot-pane" aria-label="Persistent depot preview">
          <Suspense fallback={<div className="scene-placeholder" role="status"><span />Loading 3D depot…</div>}>
            <LazyDepotScene yearResult={yearResult} />
          </Suspense>
          <VehicleInspector />
        </section>

        <section className="workspace-pane" id="workspace-content">
          <nav className="workspace-tabs" role="tablist" aria-label="Planning workspace">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                className={activeTab === tab.id ? "is-active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon tab={tab.id} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          <div
            className="workspace-content"
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
          >
            {activeTab === "overview" && <OverviewPanel result={result} yearResult={yearResult} />}
            {activeTab === "fleet" && <FleetPlanner />}
            {activeTab === "compare" && <ComparisonPanel />}
          </div>
        </section>
      </div>
    </main>
  );
}

function TabIcon({ tab }: { tab: WorkspaceTab }) {
  if (tab === "overview") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 13h6V4H4v9ZM14 20h6v-9h-6v9ZM4 20h6v-3H4v3ZM14 7h6V4h-6v3Z" /></svg>;
  if (tab === "fleet") return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 15V8h12l4 4v3M5 15h14M7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM15 8v4h4" /></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 4v16M19 4v16M5 8h6M13 16h6M8 5l3 3-3 3M16 13l-3 3 3 3" /></svg>;
}
