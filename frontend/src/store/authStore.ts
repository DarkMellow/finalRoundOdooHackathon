import { create } from "zustand";
import type { Admin } from "@/types";

interface AuthState {
  isAuthenticated: boolean;
  user: Admin | null;
  setAuth: (user: Admin) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setAuth: (user) => set({ isAuthenticated: true, user }),
  clearAuth: () => set({ isAuthenticated: false, user: null }),
}));
