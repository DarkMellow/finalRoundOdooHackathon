import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShieldCheck, Lock, Mail, ArrowRight, Building2, KeyRound, AlertCircle } from "lucide-react"

export function AdminSignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("admin@easyrental.com")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const API_BASE_URL =
    import.meta.env.VITE_SERVER_URL ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? `http://${window.location.hostname}:8000`
      : "http://127.0.0.1:8000")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || "Invalid admin secret credentials.")
      }

      const adminData = await res.json()
      localStorage.setItem("admin_user", JSON.stringify(adminData))
      navigate("/admin/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to authenticate administrator.")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = () => {
    setEmail("admin@easyrental.com")
    setPassword("admin123")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900 relative overflow-hidden">
      {/* Decorative subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="flex size-13 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-600/25">
            <ShieldCheck className="size-7 text-white" />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Admin Control Portal
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-500">
          Restricted platform access. Secret credentials required.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="size-3.5 text-indigo-600" />
                <span>Secret Admin ID / Email</span>
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@easyrental.com"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="size-3.5 text-indigo-600" />
                <span>Secret Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/20 transition-all font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter Admin Dashboard</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick preset hint box */}
          <div className="pt-4 border-t border-slate-100">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <KeyRound className="size-3.5 text-indigo-600" />
                  <span>Hardcoded Secret Credentials</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  ID: <span className="text-indigo-700 font-bold">admin@easyrental.com</span> | Pass: <span className="text-indigo-700 font-bold">admin123</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickLogin}
                className="px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold text-[10px] transition-colors"
              >
                Autofill
              </button>
            </div>
          </div>

          <div className="text-center pt-1">
            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 font-medium"
            >
              <Building2 className="size-3 text-slate-400" />
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSignIn
