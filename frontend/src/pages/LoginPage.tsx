import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

/**
 * LoginPage — placeholder for Phase 1.
 * Ayaan will build the full LoginForm UI in feature/fe-login-ui.
 */
export default function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-notion-soft">
        <h1 className="text-heading-2 mb-2 text-center text-2xl font-bold tracking-tight">
          RentFlow
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Sign in to manage your rentals
        </p>
        <div className="space-y-4">
          <p className="text-center text-caption text-muted-foreground">
            Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold">S</kbd> to bypass login (dev only)
          </p>
        </div>
      </div>
    </div>
  );
}
