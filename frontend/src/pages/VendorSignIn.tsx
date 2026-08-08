import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react"
import { AuthLayout } from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { vendorSignIn } from "@/lib/api"

export function VendorSignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!email || !password) {
      setError("Please provide your vendor email and password.")
      return
    }

    setLoading(true)
    try {
      const vendor = await vendorSignIn({ email, password })
      setLoading(false)
      setSuccess(true)
      localStorage.setItem("vendor_user", JSON.stringify(vendor))
      navigate("/vendor/dashboard")
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to authenticate vendor. Please check your credentials.")
    }
  }

  return (
    <AuthLayout
      title="Vendor Portal"
      subtitle="Authorized rental vendors. Manage listings, orders, and rental schedules."
      role="vendor"
      badgeText="Vendor Console"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-indigo-500/10 p-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Vendor authentication successful! Redirecting to vendor portal...
          </div>
        )}

        {/* Vendor Email */}
        <div className="space-y-1.5">
          <Label htmlFor="vendor-email">Vendor Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="vendor-email"
              type="email"
              placeholder="vendor@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        {/* Vendor Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="vendor-password">Password</Label>
            <a
              href="#forgot-vendor-pass"
              onClick={(e) => {
                e.preventDefault()
                alert("Password reset instructions sent to vendor email.")
              }}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="vendor-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-9"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-10 gap-2 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
          disabled={loading}
        >
          {loading ? (
            "Authenticating..."
          ) : (
            <>
              <span>Sign In as Vendor</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        {/* Footer Switches */}
        <div className="pt-4 border-t border-border/40 space-y-2 text-center text-xs">
          <p className="text-muted-foreground">
            New vendor?{" "}
            <Link to="/vendor/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Vendor Registration
            </Link>
          </p>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-muted-foreground">
            <User className="size-3.5 text-blue-500" />
            <span>Looking for customer portal?</span>
            <Link to="/customer/signin" className="font-semibold text-primary hover:underline">
              Customer Sign In
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
