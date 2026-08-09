import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  Pencil,
  Search,
  Trash2,
  Upload,
  User,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  fetchVendorProfile,
  formatVendorAddress,
  mockVendorProfile,
  parseVendorAddress,
  updateVendorProfile,
  type VendorProfileData,
} from "@/lib/vendorProfileFetcher"

function FormField({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-slate-700">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 border-slate-200 bg-white text-sm text-slate-900 focus-visible:ring-indigo-500"
      />
    </div>
  )
}

export function VendorProfile() {
  const [original, setOriginal] = useState<VendorProfileData | null>(null)
  const [form, setForm] = useState<VendorProfileData | null>(null)
  const [addressText, setAddressText] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetchVendorProfile()
      .then((data) => {
        setOriginal(data)
        setForm(data)
        setAddressText(formatVendorAddress(data.address))
      })
      .catch((err) => {
        console.error("Unable to load vendor profile", err)
        setError("Could not load profile. Showing sample data.")
        setOriginal(mockVendorProfile)
        setForm(mockVendorProfile)
        setAddressText(formatVendorAddress(mockVendorProfile.address))
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDiscard = () => {
    if (!original) return
    setForm({ ...original })
    setAddressText(formatVendorAddress(original.address))
    setToast("Changes discarded.")
    setTimeout(() => setToast(null), 2500)
  }

  const handleSave = async () => {
    if (!form || !original) return

    setSaving(true)
    try {
      const parsedAddress = parseVendorAddress(addressText, form.address)
      const payload = {
        ...form,
        address: parsedAddress,
      }
      const updated = await updateVendorProfile(payload)
      setOriginal(updated)
      setForm(updated)
      setAddressText(formatVendorAddress(updated.address))
      setToast("Profile saved successfully.")
    } catch (err) {
      console.error("Failed to save vendor profile", err)
      setToast("Failed to save profile. Try again.")
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 2500)
    }
  }

  const updateField = <K extends keyof VendorProfileData>(key: K, value: VendorProfileData[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <span className="size-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          Loading settings...
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600">
        <p className="text-sm font-semibold">{error ?? "Profile unavailable."}</p>
        <Link to="/vendor/dashboard" className="text-xs font-bold text-indigo-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-4 shadow-xs backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/vendor/dashboard"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Settings</h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={handleDiscard} disabled={saving}>
                Discard
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:mx-0">
            <Input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 border-slate-200 bg-slate-50 pr-10 text-xs focus-visible:ring-indigo-500"
            />
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-xs">
            <span className="text-xs font-semibold capitalize text-slate-700">{form.role}</span>
            <div className="relative">
              {form.profileImageUrl ? (
                <img
                  src={form.profileImageUrl}
                  alt={form.name}
                  className="size-8 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                  {form.name.charAt(0)}
                </div>
              )}
              {form.isOnline && (
                <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            {error}
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-800 shadow-lg animate-in fade-in slide-in-from-bottom-2">
            {toast}
          </div>
        )}

        {/* Main settings card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr_220px]">
            {/* Left column — general info */}
            <div className="space-y-4">
              <h2 className="border-b border-slate-100 pb-2 text-sm font-bold text-slate-900">
                General Information
              </h2>
              <FormField
                label="Name"
                id="vendor-name"
                value={form.name}
                onChange={(v) => updateField("name", v)}
              />
              <FormField
                label="Email"
                id="vendor-email"
                type="email"
                value={form.email}
                onChange={(v) => updateField("email", v)}
              />
              <FormField
                label="Phone"
                id="vendor-phone"
                value={form.phone}
                onChange={(v) => updateField("phone", v)}
              />
              <FormField
                label="Company Name"
                id="vendor-company"
                value={form.companyName}
                onChange={(v) => updateField("companyName", v)}
              />
            </div>

            {/* Middle column — business details */}
            <div className="space-y-4">
              <h2 className="border-b border-slate-100 pb-2 text-sm font-bold text-slate-900">
                Business Details
              </h2>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Company Logo
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex size-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {form.companyLogoUrl ? (
                      <img
                        src={form.companyLogoUrl}
                        alt="Company logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="size-7 text-slate-300" />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={() =>
                      setToast("Logo upload — connect to POST /api/v1/vendor/profile/upload")
                    }
                  >
                    <Upload className="size-3.5" />
                    Upload
                  </Button>
                </div>
              </div>

              <FormField
                label="GST In"
                id="vendor-gst"
                value={form.gstNumber}
                onChange={(v) => updateField("gstNumber", v)}
                placeholder="e.g. 29AABCU9603R1ZM"
              />

              <div className="space-y-1.5">
                <Label
                  htmlFor="vendor-address"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Address
                </Label>
                <textarea
                  id="vendor-address"
                  rows={4}
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  placeholder="Street address&#10;City, State ZIP&#10;Country"
                />
              </div>

              <FormField
                label="Category"
                id="vendor-category"
                value={form.category}
                onChange={(v) => updateField("category", v)}
              />

              <FormField
                label="Website"
                id="vendor-website"
                value={form.website ?? ""}
                onChange={(v) => updateField("website", v)}
                placeholder="https://yourcompany.com"
              />
            </div>

            {/* Right column — profile picture */}
            <div className="flex flex-col items-center">
              <h2 className="mb-4 w-full border-b border-slate-100 pb-2 text-sm font-bold text-slate-900">
                Profile Picture
              </h2>

              <div className="relative">
                {form.isOnline && (
                  <span className="absolute -top-1 left-1/2 z-10 size-3 -translate-x-1/2 rounded-full border-2 border-white bg-emerald-500" />
                )}
                <div className="relative size-44 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 shadow-sm">
                  {form.profileImageUrl ? (
                    <img
                      src={form.profileImageUrl}
                      alt={form.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <User className="size-16 stroke-[1.5]" />
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-slate-900/60 p-2 backdrop-blur-sm">
                    <button
                      type="button"
                      title="Edit photo"
                      onClick={() =>
                        setToast("Photo edit — connect to POST /api/v1/vendor/profile/upload")
                      }
                      className="flex size-8 items-center justify-center rounded-full bg-white/90 text-slate-700 transition-colors hover:bg-white"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Remove photo"
                      onClick={() => updateField("profileImageUrl", undefined)}
                      className="flex size-8 items-center justify-center rounded-full bg-white/90 text-rose-600 transition-colors hover:bg-white"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-xs font-semibold text-slate-800">{form.name}</p>
              <p className="mt-0.5 text-center text-[10px] text-slate-500">{form.companyName}</p>
              {form.isVerified && (
                <span className="mt-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  Verified Vendor
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorProfile
