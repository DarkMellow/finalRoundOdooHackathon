import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react"
import { AuthLayout } from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminSignIn } from "@/lib/api"

export function AdminSignIn() {
  const [adminId, setAdminId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!adminId || !password) {
      setError("Please provide your admin email and password.")
      return
    }

    setLoading(true)
    try {
      const admin = await adminSignIn({ email: adminId, password })
      setLoading(false)
      setSuccess(true)
      localStorage.setItem("admin_user", JSON.stringify(admin))
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to authenticate admin. Please check your credentials.")
    }
  }

  return (
    <AuthLayout
      title="Admin Portal"
      subtitle="Authorized personnel only. Access system metrics, tenant management, and listings."
      role="admin"
      badgeText="Admin Console"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-indigo-500/10 p-3 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Admin authentication successful! Accessing control panel...
          </div>
        )}

        {/* Admin Email */}
        <div className="space-y-1.5">
          <Label htmlFor="admin-email">Admin Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@rentalsuite.com"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        {/* Admin Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="admin-password">Master Password</Label>
            <a
              href="#forgot-admin-pass"
              onClick={(e) => {
                e.preventDefault()
                alert("Super-admin key reset requested. Check administrator email.")
              }}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reset master key?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="admin-password"
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
              <span>Sign In to Admin Console</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        {/* Footer Switches */}
        <div className="pt-4 border-t border-border/40 space-y-2 text-center text-xs">
          <p className="text-muted-foreground">
            New administrator?{" "}
            <Link to="/admin/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Request Admin Registration
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
