import { NavLink } from "react-router-dom"
import { Building2, User, ShieldCheck } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <NavLink to="/customer/signin" className="flex items-center gap-2.5 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
            <Building2 className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight leading-tight">RentalSuite</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Management System
            </span>
          </div>
        </NavLink>

        {/* Auth Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Customer Group */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/40 text-xs font-medium">
            <div className="flex items-center gap-1 px-2 py-1 text-muted-foreground font-semibold">
              <User className="size-3.5" />
              <span className="hidden md:inline">Customer</span>
            </div>
            <NavLink
              to="/customer/signin"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-background text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Sign In
            </NavLink>
            <NavLink
              to="/customer/signup"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-background text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Sign Up
            </NavLink>
          </div>

          <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

          {/* Admin Group */}
          <div className="flex items-center bg-slate-900/10 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-700/20 text-xs font-medium">
            <div className="flex items-center gap-1 px-2 py-1 text-slate-700 dark:text-slate-300 font-semibold">
              <ShieldCheck className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden md:inline">Admin</span>
            </div>
            <NavLink
              to="/admin/signin"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Sign In
            </NavLink>
            <NavLink
              to="/admin/signup"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              Sign Up
            </NavLink>
          </div>
        </nav>
      </div>
    </header>
  )
}
