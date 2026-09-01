import { create } from "zustand";
import { optimizeTransitionPlan } from "../domain/fleet";
import type {
  Assumptions,
  PlanId,
  PlannerWorkspace,
  TransitionPlan,
} from "../domain/fleet";
import { sampleAssumptions, sampleWorkspace } from "../sampleScenario";

interface OptimizationNotice {
  planId: PlanId;
  transitionedCount: number;
  retainedCount: number;
}

interface PlannerState {
  workspace: PlannerWorkspace;
  activePlanId: PlanId;
  selectedYear: number;
  selectedVehicleId: string | null;
  selectedVehicleIds: string[];
  previousOptimizedPlan: TransitionPlan | null;
  optimizationNotice: OptimizationNotice | null;

  setActivePlanId: (planId: PlanId) => void;
  setSelectedYear: (year: number) => void;
  setSelectedVehicleId: (vehicleId: string | null) => void;
  setSelectedVehicleIds: (vehicleIds: string[]) => void;
  toggleVehicleSelected: (vehicleId: string) => void;
  setVehicleTransitionYear: (
    vehicleId: string,
    transitionYear: number | null,
  ) => void;
  setVehiclesTransitionYear: (
    vehicleIds: string[],
    transitionYear: number | null,
  ) => void;
  updateAssumption: <K extends keyof Assumptions>(
    key: K,
    value: Assumptions[K],
  ) => void;
  resetAssumptions: () => void;
  optimizeActivePlan: () => void;
  undoOptimization: () => void;
  clearOptimizationNotice: () => void;
}

function initialWorkspace(): PlannerWorkspace {
  return structuredClone(sampleWorkspace);
}

function updateActivePlan(
  state: PlannerState,
  updater: (plan: TransitionPlan) => TransitionPlan,
): PlannerWorkspace {
  const currentPlan = state.workspace.plans[state.activePlanId];
  return {
    ...state.workspace,
    plans: {
      ...state.workspace.plans,
      [state.activePlanId]: updater(currentPlan),
    },
  };
}

export const usePlannerStore = create<PlannerState>((set) => ({
  workspace: initialWorkspace(),
  activePlanId: "planA",
  selectedYear: sampleAssumptions.startYear,
  selectedVehicleId: null,
  selectedVehicleIds: [],
  previousOptimizedPlan: null,
  optimizationNotice: null,

  setActivePlanId: (activePlanId) => set({ activePlanId }),
  setSelectedYear: (selectedYear) => set({ selectedYear }),
  setSelectedVehicleId: (selectedVehicleId) => set({ selectedVehicleId }),
  setSelectedVehicleIds: (selectedVehicleIds) =>
    set({ selectedVehicleIds: [...new Set(selectedVehicleIds)] }),
  toggleVehicleSelected: (vehicleId) =>
    set((state) => ({
      selectedVehicleIds: state.selectedVehicleIds.includes(vehicleId)
        ? state.selectedVehicleIds.filter((id) => id !== vehicleId)
        : [...state.selectedVehicleIds, vehicleId],
    })),

  setVehicleTransitionYear: (vehicleId, transitionYear) =>
    set((state) => ({
      workspace: updateActivePlan(state, (plan) => ({
        ...plan,
        vehicles: plan.vehicles.map((vehicle) =>
          vehicle.id === vehicleId
            ? { ...vehicle, transitionYear }
            : vehicle,
        ),
      })),
      previousOptimizedPlan: null,
      optimizationNotice: null,
    })),

  setVehiclesTransitionYear: (vehicleIds, transitionYear) =>
    set((state) => {
      const selected = new Set(vehicleIds);
      return {
        workspace: updateActivePlan(state, (plan) => ({
          ...plan,
          vehicles: plan.vehicles.map((vehicle) =>
            selected.has(vehicle.id)
              ? { ...vehicle, transitionYear }
              : vehicle,
          ),
        })),
        selectedVehicleIds: [],
        previousOptimizedPlan: null,
        optimizationNotice: null,
      };
    }),

  updateAssumption: (key, value) =>
    set((state) => ({
      workspace: {
        ...state.workspace,
        assumptions: {
          ...state.workspace.assumptions,
          [key]: value,
        },
      },
      previousOptimizedPlan: null,
      optimizationNotice: null,
    })),

  resetAssumptions: () =>
    set((state) => ({
      workspace: {
        ...state.workspace,
        assumptions: structuredClone(sampleAssumptions),
      },
      selectedYear: sampleAssumptions.startYear,
      previousOptimizedPlan: null,
      optimizationNotice: null,
    })),

  optimizeActivePlan: () =>
    set((state) => {
      const currentPlan = state.workspace.plans[state.activePlanId];
      const optimized = optimizeTransitionPlan(
        currentPlan,
        state.workspace.assumptions,
      );
      return {
        workspace: {
          ...state.workspace,
          plans: {
            ...state.workspace.plans,
            [state.activePlanId]: optimized.plan,
          },
        },
        previousOptimizedPlan: structuredClone(currentPlan),
        selectedVehicleIds: [],
        optimizationNotice: {
          planId: state.activePlanId,
          transitionedCount: optimized.transitionedVehicleIds.length,
          retainedCount: optimized.retainedVehicleIds.length,
        },
      };
    }),

  undoOptimization: () =>
    set((state) => {
      const previousPlan = state.previousOptimizedPlan;
      if (!previousPlan) return state;
      return {
        workspace: {
          ...state.workspace,
          plans: {
            ...state.workspace.plans,
            [previousPlan.id]: previousPlan,
          },
        },
        activePlanId: previousPlan.id,
        previousOptimizedPlan: null,
        optimizationNotice: null,
      };
    }),

  clearOptimizationNotice: () => set({ optimizationNotice: null }),
}));
