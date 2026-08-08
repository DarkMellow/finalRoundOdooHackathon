import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AppLayout from "@/layouts/AppLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import RentalsPage from "@/pages/RentalsPage";
import NewRentalPage from "@/pages/NewRentalPage";
import RentalDetailPage from "@/pages/RentalDetailPage";
import { useAuthStore } from "@/store/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * DEV ONLY: Press "S" anywhere to bypass login and authenticate as a dummy admin.
 * Remove this before production.
 */
function useDevAuthBypass() {
  const { isAuthenticated, setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "s" || e.key === "S") {
        if (!isAuthenticated) {
          setAuth({ id: 1, username: "dev_admin" });
          navigate("/dashboard");
          console.log("[DEV] Auth bypassed — logged in as dev_admin");
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthenticated, setAuth, navigate]);
}

export default function App() {
  useDevAuthBypass();

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes behind AppLayout shell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="rentals" element={<RentalsPage />} />
          <Route path="rentals/new" element={<NewRentalPage />} />
          <Route path="rentals/:id" element={<RentalDetailPage />} />
        </Route>

        {/* Catch-all → dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}
