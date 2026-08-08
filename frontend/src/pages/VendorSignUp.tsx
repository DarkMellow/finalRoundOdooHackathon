import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Building } from "lucide-react"
import { AuthLayout } from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { vendorSignUp } from "@/lib/api"

export function VendorSignUp() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    setLoading(true)
    try {
      await vendorSignUp({
        full_name: fullName,
        email,
        password,
        company_name: companyName || undefined,
      })
      setLoading(false)
      setSuccess(true)
      setTimeout(() => {
        navigate("/vendor/dashboard")
      }, 500)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to register vendor. Please try again.")
    }
  }

  return (
    <AuthLayout
      title="Vendor Registration"
      subtitle="Register as a vendor to list your properties and items for rental."
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
            Vendor account created! Redirecting to vendor portal...
          </div>
        )}

        {/* Vendor Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="vendor-signup-name">Full Name / Contact Person</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="vendor-signup-name"
              type="text"
              placeholder="Alex Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        {/* Company Name */}
        <div className="space-y-1.5">
          <Label htmlFor="vendor-company">Company / Business Name (Optional)</Label>
          <div className="relative">
            <Building className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="vendor-company"
              type="text"
              placeholder="Apex Rentals Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="vendor-signup-email">Business Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="vendor-signup-email"
              type="email"
              placeholder="alex@apexrentals.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="vendor-signup-pass">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="vendor-signup-pass"
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

          <div className="space-y-1.5">
            <Label htmlFor="vendor-confirm-pass">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="vendor-confirm-pass"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-10 gap-2 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
          disabled={loading}
        >
          {loading ? (
            "Registering Vendor..."
          ) : (
            <>
              <span>Register Vendor Account</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        {/* Footer Switches */}
        <div className="pt-4 border-t border-border/40 space-y-2 text-center text-xs">
          <p className="text-muted-foreground">
            Already registered as vendor?{" "}
            <Link to="/vendor/signin" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Vendor Sign In
            </Link>
          </p>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-muted-foreground">
            <User className="size-3.5 text-blue-500" />
            <span>Looking for customer portal?</span>
            <Link to="/customer/signin" className="font-semibold text-primary hover:underline">
              Customer Portal
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
