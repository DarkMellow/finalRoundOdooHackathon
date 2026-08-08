import React from "react"
import { ShieldCheck, UserCheck, Sparkles, Building2, CheckCircle2 } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  role: "customer" | "admin"
  badgeText: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
  role,
  badgeText,
}: AuthLayoutProps) {
  const isAdmin = role === "admin"

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-background via-muted/20 to-muted/40">
      <div className="mx-auto flex w-full max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl min-h-[580px]">
        {/* Left Decorative Banner Panel */}
        <div
          className={`hidden lg:flex flex-col justify-between w-5/12 p-8 text-white relative overflow-hidden ${
            isAdmin
              ? "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900"
              : "bg-gradient-to-br from-blue-700 via-indigo-700 to-sky-600"
          }`}
        >
          {/* Subtle geometric overlay shapes */}
          <div className="absolute -top-24 -left-24 size-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -right-24 size-80 rounded-full bg-indigo-500/20 blur-3xl" />

          {/* Top Brand Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20">
              {isAdmin ? (
                <ShieldCheck className="size-3.5 text-indigo-300" />
              ) : (
                <UserCheck className="size-3.5 text-blue-200" />
              )}
              <span>{badgeText}</span>
            </div>

            <h2 className="mt-6 text-3xl font-extrabold tracking-tight leading-tight">
              {isAdmin ? "Enterprise Property Management" : "Find & Manage Your Ideal Space"}
            </h2>
            <p className="mt-3 text-sm text-white/80 leading-relaxed">
              {isAdmin
                ? "Powerful admin tools to oversee bookings, tenants, pricing strategies, and property maintenance in real-time."
                : "Browse verified rental listings, request tours, manage leases, and handle payments effortlessly."}
            </p>
          </div>

          {/* Feature Bullets */}
          <div className="relative z-10 space-y-3 my-6">
            {(isAdmin
              ? [
                  "Real-time Occupancy Analytics",
                  "Automated Tenant Verification",
                  "Comprehensive Billing & Invoicing",
                ]
              : [
                  "Instant Booking Requests",
                  "Secure Digital Payments",
                  "24/7 Tenant Support Access",
                ]
            ).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs font-medium text-white/90">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Bottom Card Footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-4 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-white/80" />
              <span>RentalSuite Platform</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px]">
              <Sparkles className="size-3 text-amber-300" />
              <span>v2.0 Ready</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex flex-1 flex-col justify-center p-6 sm:p-10 lg:p-12 bg-card">
          <div className="mx-auto w-full max-w-md space-y-6">
            {/* Header */}
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex lg:hidden items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold mb-2">
                {isAdmin ? (
                  <ShieldCheck className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <UserCheck className="size-3.5 text-blue-600 dark:text-blue-400" />
                )}
                <span>{badgeText}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {subtitle}
              </p>
            </div>

            {/* Form Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
