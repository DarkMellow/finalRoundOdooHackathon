import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  Check,
  Pencil,
  Search,
  Upload,
  X,
  Sparkles,
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
  uploadVendorAsset,
  type VendorProfileData,
} from "@/lib/vendorProfilePageApi"

function FormField({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}: {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
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
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 border-slate-200 text-sm text-slate-900 focus-visible:ring-indigo-500 transition-colors ${
          disabled
            ? "bg-slate-100/70 text-slate-700 cursor-not-allowed border-slate-200 shadow-none"
            : "bg-white border-slate-300"
        }`}
      />
    </div>
  )
}

export function VendorProfile() {
  const [original, setOriginal] = useState<VendorProfileData | null>(null)
  const [form, setForm] = useState<VendorProfileData | null>(null)
  const [addressText, setAddressText] = useState("")
  const [isEditing, setIsEditing] = useState(false)
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
    setIsEditing(false)
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
      setIsEditing(false)
      setToast("Profile saved successfully!")
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
    if (!isEditing) {
      setIsEditing(true)
    }
  }

  const handleFileUpload = async (type: "logo" | "profile", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await uploadVendorAsset(type, file)
      if (type === "logo") {
        updateField("companyLogoUrl", res.url)
      } else {
        updateField("profileImageUrl", res.url)
      }
      setToast(`${type === "logo" ? "Company Logo" : "Profile Picture"} updated.`)
      setTimeout(() => setToast(null), 2500)
    } catch (err) {
      console.error("Upload error", err)
    }
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
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

            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Store Settings</h1>

            {/* HEADER ACTION BUTTONS */}
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Pencil className="size-3.5" />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    {saving ? (
                      <>
                        <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="size-3.5" />
                        <span>Save</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDiscard}
                    disabled={saving}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs gap-1.5 shadow-xs"
                  >
                    <X className="size-3.5" />
                    <span>Discard</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Search bar */}
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

          {/* User badge */}
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

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            {error}
          </div>
        )}

        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-slate-200 bg-slate-900 text-white px-4 py-3 text-xs font-semibold shadow-xl animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2">
            <Sparkles className="size-4 text-emerald-400" />
            <span>{toast}</span>
          </div>
        )}

        {/* Edit mode indicator banner */}
        {isEditing && (
          <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-indigo-600 animate-ping" />
              <p className="font-bold">Edit Mode Active — Update profile information below.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDiscard}
                disabled={saving}
                className="h-8 border-indigo-300 text-indigo-800 hover:bg-indigo-100 font-bold text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Main settings card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column — general info */}
            <div className="space-y-4">
              <h2 className="border-b border-slate-100 pb-2 text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>General Information</span>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Pencil className="size-3" />
                    <span>Edit</span>
                  </button>
                )}
              </h2>
              <FormField
                label="Name"
                id="vendor-name"
                value={form.name}
                disabled={!isEditing}
                onChange={(v) => updateField("name", v)}
              />
              <FormField
                label="Email"
                id="vendor-email"
                type="email"
                value={form.email}
                disabled={!isEditing}
                onChange={(v) => updateField("email", v)}
              />
              <FormField
                label="Phone"
                id="vendor-phone"
                value={form.phone}
                disabled={!isEditing}
                onChange={(v) => updateField("phone", v)}
              />
              <FormField
                label="Company Name"
                id="vendor-company"
                value={form.companyName}
                disabled={!isEditing}
                onChange={(v) => updateField("companyName", v)}
              />
            </div>

            {/* Right column — business details */}
            <div className="space-y-4">
              <h2 className="border-b border-slate-100 pb-2 text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Business Details</span>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Pencil className="size-3" />
                    <span>Edit</span>
                  </button>
                )}
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
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload("logo", e)}
                    />
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs transition-colors">
                      <Upload className="size-3.5" />
                      Upload Logo
                    </span>
                  </label>
                </div>
              </div>

              <FormField
                label="GST In"
                id="vendor-gst"
                value={form.gstNumber}
                disabled={!isEditing}
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
                  disabled={!isEditing}
                  onChange={(e) => {
                    setAddressText(e.target.value)
                    if (!isEditing) setIsEditing(true)
                  }}
                  className={`w-full resize-none rounded-lg border p-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    !isEditing
                      ? "bg-slate-100/70 border-slate-200 text-slate-700 cursor-not-allowed"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                  placeholder="Street address&#10;City, State ZIP&#10;Country"
                />
              </div>

              <FormField
                label="Category"
                id="vendor-category"
                value={form.category}
                disabled={!isEditing}
                onChange={(v) => updateField("category", v)}
              />

              <FormField
                label="Website"
                id="vendor-website"
                value={form.website ?? ""}
                disabled={!isEditing}
                onChange={(v) => updateField("website", v)}
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorProfile
