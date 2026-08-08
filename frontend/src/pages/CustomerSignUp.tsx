import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react"
import { AuthLayout } from "@/components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { customerSignUp } from "@/lib/api"

export function CustomerSignUp() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
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

    if (!agreeTerms) {
      setError("You must accept the terms of service and privacy policy.")
      return
    }

    setLoading(true)
    try {
      await customerSignUp({
        full_name: fullName,
        email,
        password,
        phone_number: phone || undefined,
      })
      setLoading(false)
      setSuccess(true)
      setTimeout(() => {
        navigate("/customer/catalog")
      }, 500)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || "Failed to create account. Please try again.")
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Sign up as a customer to start browsing and renting properties."
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
            Account created successfully! You can now{" "}
            <Link to="/customer/signin" className="underline font-bold">
              Sign In
            </Link>
            .
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="customer-name"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-signup-email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="customer-signup-email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <Label htmlFor="customer-phone">Phone Number (Optional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              id="customer-phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="customer-signup-pass">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="customer-signup-pass"
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
            <Label htmlFor="customer-confirm-pass">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="customer-confirm-pass"
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

        {/* Terms Checkbox */}
        <div className="flex items-start space-x-2 pt-1">
          <input
            type="checkbox"
            id="agree-terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary accent-primary"
            required
          />
          <Label htmlFor="agree-terms" className="text-xs leading-normal cursor-pointer">
            I agree to the{" "}
            <a href="#terms" onClick={(e) => e.preventDefault()} className="text-primary hover:underline font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-primary hover:underline font-medium">
              Privacy Policy
            </a>
          </Label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-10 gap-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
          disabled={loading}
        >
          {loading ? (
            "Creating Account..."
          ) : (
            <>
              <span>Create Customer Account</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        {/* Footer Switches */}
        <div className="pt-4 border-t border-border/40 space-y-2 text-center text-xs">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link to="/customer/signin" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>

          <div className="pt-2 flex items-center justify-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="size-3.5 text-indigo-500" />
            <span>Need administrator privileges?</span>
            <Link to="/admin/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Admin Register
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
