import { create } from "zustand";
import type { DashboardFilter } from "@/types";

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  dashboardFilter: DashboardFilter;
  setDashboardFilter: (filter: DashboardFilter) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  dashboardFilter: "All",
  setDashboardFilter: (filter) => set({ dashboardFilter: filter }),
}));
