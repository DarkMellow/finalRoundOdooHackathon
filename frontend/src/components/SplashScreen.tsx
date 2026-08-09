import { useEffect, useState } from "react"
import { Building2, Sparkles, ShieldCheck, Store } from "lucide-react"

interface SplashScreenProps {
  appName?: string
  subtitle?: string
  role?: "customer" | "vendor" | "admin"
  durationMs?: number
  onFinish?: () => void
}

export function SplashScreen({
  appName = "EasyRental",
  subtitle = "Smart Rental & Asset Management Platform",
  role = "customer",
  durationMs = 750,
  onFinish,
}: SplashScreenProps) {
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, Math.max(300, durationMs - 220))

    const finishTimer = setTimeout(() => {
      setVisible(false)
      if (onFinish) onFinish()
    }, durationMs)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(finishTimer)
    }
  }, [durationMs, onFinish])

  if (!visible) return null

  const isVendor = role === "vendor"
  const isAdmin = role === "admin"

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 text-slate-900 transition-opacity duration-300 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background ambient subtle pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-70 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Brand Icon */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="absolute size-24 rounded-3xl bg-indigo-500/15 blur-xl animate-pulse" />
          <div className="relative flex size-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/25 border border-indigo-400/30">
            {isAdmin ? (
              <ShieldCheck className="size-10 text-white animate-pulse" />
            ) : isVendor ? (
              <Store className="size-10 text-white animate-pulse" />
            ) : (
              <Building2 className="size-10 text-white animate-pulse" />
            )}
            <div className="absolute -top-1.5 -right-1.5 flex size-6 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-md">
              <Sparkles className="size-3.5 fill-current" />
            </div>
          </div>
        </div>

        {/* Brand Text */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
          {appName}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-500 max-w-xs">
          {subtitle}
        </p>

        {/* Role Pill */}
        <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs font-mono">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>
            {isAdmin
              ? "Admin Control Portal"
              : isVendor
              ? "Vendor Store Portal"
              : "Customer Rental Portal"}
          </span>
        </div>

        {/* Smooth Light Theme Loader Bar */}
        <div className="mt-7 w-40 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full animate-[progress_0.75s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  )
}

export default SplashScreen
