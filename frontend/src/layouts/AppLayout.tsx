import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FileText,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/rentals", icon: FileText, label: "Rentals" },
  { to: "/products", icon: Package, label: "Products" },
] as const;

/** Map pathname → page title and primary action */
function getPageMeta(pathname: string) {
  if (pathname === "/dashboard")
    return { title: "Dashboard", action: "+ New Rental", actionTo: "/rentals/new" };
  if (pathname.startsWith("/rentals/new"))
    return { title: "New Rental", action: null, actionTo: null };
  if (pathname.startsWith("/rentals/"))
    return { title: "Rental Detail", action: null, actionTo: null };
  if (pathname.startsWith("/rentals"))
    return { title: "Rentals", action: "+ New Rental", actionTo: "/rentals/new" };
  if (pathname === "/products")
    return { title: "Products", action: "+ New Product", actionTo: null };
  return { title: "Rental Management", action: null, actionTo: null };
}

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  const { title, action, actionTo } = getPageMeta(location.pathname);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // proceed even if server call fails
    }
    clearAuth();
    navigate("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ─── Mobile Sidebar Overlay ─── */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r
          border-sidebar-border bg-sidebar transition-transform duration-200 ease-in-out
          md:static md:translate-x-0
          ${sidebarCollapsed ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Logo / App Name */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Package className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-heading-3 text-lg font-bold tracking-tight text-sidebar-foreground">
            RentFlow
          </span>

          {/* Close button on mobile */}
          <button
            onClick={toggleSidebar}
            className="ml-auto rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm transition-colors duration-150
                ${
                  isActive
                    ? "bg-sidebar-accent font-medium text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Admin + Logout */}
        <div className="border-t border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-eyebrow font-semibold uppercase text-sidebar-foreground">
              {user?.username?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">
                {user?.username || "Admin"}
              </p>
              <p className="text-xs text-sidebar-foreground/50">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:px-8">
          <div className="flex items-center gap-3">
            {/* Hamburger on mobile */}
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1.5 text-foreground/60 hover:bg-accent hover:text-foreground md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-heading-2 text-xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
          </div>

          {/* Primary contextual action button */}
          {action && (
            <Button
              onClick={() => {
                if (actionTo) navigate(actionTo);
              }}
              size="sm"
              className="gap-1.5 rounded-full px-4 shadow-notion-soft"
              id={`btn-${action.replace(/[^a-zA-Z]/g, "-").toLowerCase()}`}
            >
              <Plus className="h-4 w-4" />
              {action}
            </Button>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
