import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react"
import { AuthLayout } from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { customerSignIn } from "@/lib/api"

export function CustomerSignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!email || !password) {
      setError("Please fill in all required fields.")
      return
    }

    setLoading(true)
    try {
      const user = await customerSignIn({ email, password })
      setLoading(false)
      setSuccess(true)
      localStorage.setItem("user", JSON.stringify(user))
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to sign in. Please check your credentials.")
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your customer account to manage your rentals and bookings."
      role="customer"
      badgeText="Customer Portal"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Sign in successful! Welcome back.
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="customer-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="customer-password">Password</Label>
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault()
                alert("Password reset instructions sent to your email.")
              }}
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="customer-password"
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

        {/* Remember Me */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 rounded border-input text-primary focus:ring-primary accent-primary"
          />
          <Label htmlFor="remember-me" className="text-xs cursor-pointer">
            Remember this device for 30 days
          </Label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-10 gap-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
          disabled={loading}
        >
          {loading ? (
            "Signing in..."
          ) : (
            <>
              <span>Sign In as Customer</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        {/* Footer Switches */}
        <div className="pt-4 border-t border-border/40 space-y-2 text-center text-xs">
          <p className="text-muted-foreground">
            Don&apos;t have a customer account?{" "}
            <Link to="/customer/signup" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="size-3.5 text-indigo-500" />
            <span>Are you a property manager?</span>
            <Link to="/admin/signin" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Admin Sign In
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
