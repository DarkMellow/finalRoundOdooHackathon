import { API_BASE_URL } from "@/lib/api"

// ---------------------------------------------------------------------------
// Types — aligned with backend VendorProfile / User models; extended for UI.
// Backend engineer: map API responses to VendorProfileData in fetchVendorProfile().
// ---------------------------------------------------------------------------

export interface VendorAddress {
  line1: string
  line2?: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface VendorProfileData {
  id: number
  role: "vendor" | "admin"
  name: string
  email: string
  phone: string
  companyName: string
  companyLogoUrl?: string
  profileImageUrl?: string
  gstNumber: string
  address: VendorAddress
  category: string
  isVerified: boolean
  isOnline: boolean
  website?: string
  description?: string
  businessRegistrationNumber?: string
  createdAt: string
  updatedAt: string
}

export type VendorProfileUpdatePayload = Omit<
  VendorProfileData,
  "id" | "role" | "isVerified" | "createdAt" | "updatedAt"
>

/** Flatten address into a multi-line display string for textarea binding. */
export function formatVendorAddress(address: VendorAddress): string {
  return [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.zipCode}`,
    address.country,
  ]
    .filter(Boolean)
    .join("\n")
}

/** Parse textarea content back into structured address (best-effort for form edits). */
export function parseVendorAddress(value: string, fallback: VendorAddress): VendorAddress {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return fallback

  const lastLine = lines[lines.length - 1] ?? fallback.country
  const cityStateZip = lines.length >= 3 ? lines[lines.length - 2] : ""
  const [city = fallback.city, stateZip = ""] = cityStateZip.split(",").map((s) => s.trim())
  const zipMatch = stateZip.match(/(\d[\d\s-]*)/)
  const state = stateZip.replace(zipMatch?.[0] ?? "", "").trim() || fallback.state

  return {
    line1: lines[0] ?? fallback.line1,
    line2: lines.length > 3 ? lines[1] : lines.length === 3 ? undefined : lines[1],
    city: city || fallback.city,
    state: state || fallback.state,
    zipCode: zipMatch?.[0]?.trim() || fallback.zipCode,
    country: lastLine.includes(",") ? fallback.country : lastLine || fallback.country,
  }
}

// ---------------------------------------------------------------------------
// In-Memory Stateful Mock Data — allows persisting edits across component lifecycle
// ---------------------------------------------------------------------------

export const mockVendorProfile: VendorProfileData = {
  id: 101,
  role: "admin",
  name: "Rajesh Kumar",
  email: "rajesh.kumar@apexrentals.com",
  phone: "+91-9876543210",
  companyName: "Apex Rentals Pvt. Ltd.",
  companyLogoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80",
  profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
  gstNumber: "29AABCU9603R1ZM",
  address: {
    line1: "42 Ball Streets",
    line2: "Industrial Estate, Block C",
    city: "London",
    state: "Greater London",
    zipCode: "SW1A 1AA",
    country: "United Kingdom",
  },
  category: "Electronics & Furniture Rental",
  isVerified: true,
  isOnline: true,
  website: "https://apexrentals.example.com",
  description: "Premium rental marketplace for electronics, furniture, and office equipment.",
  businessRegistrationNumber: "BR-2024-88421",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2026-07-28T14:22:00Z",
}

let activeVendorProfileState: VendorProfileData = { ...mockVendorProfile }

// ---------------------------------------------------------------------------
// API fetchers — swap mock implementation for real endpoints when ready.
// ---------------------------------------------------------------------------

/**
 * Fetch the logged-in vendor's profile settings.
 *
 * Backend endpoint (suggested): GET /api/v1/vendor/profile
 * Expected response shape: VendorProfileData
 */
export async function fetchVendorProfile(): Promise<VendorProfileData> {
  // Uncomment when backend is ready:
  // const res = await fetch(`${API_BASE_URL}/api/v1/vendor/profile`, {
  //   headers: { Authorization: `Bearer ${localStorage.getItem("vendor_token")}` },
  // })
  // if (!res.ok) throw new Error("Failed to fetch vendor profile")
  // return res.json()

  void API_BASE_URL
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...activeVendorProfileState }), 350)
  })
}

/**
 * Persist vendor profile changes.
 *
 * Backend endpoint (suggested): PUT /api/v1/vendor/profile
 */
export async function updateVendorProfile(
  payload: VendorProfileUpdatePayload
): Promise<VendorProfileData> {
  // Uncomment when backend is ready:
  // const res = await fetch(`${API_BASE_URL}/api/v1/vendor/profile`, {
  //   method: "PUT",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${localStorage.getItem("vendor_token")}`,
  //   },
  //   body: JSON.stringify(payload),
  // })
  // if (!res.ok) throw new Error("Failed to update vendor profile")
  // return res.json()

  return new Promise((resolve) => {
    setTimeout(() => {
      activeVendorProfileState = {
        ...activeVendorProfileState,
        ...payload,
        updatedAt: new Date().toISOString(),
      }
      resolve({ ...activeVendorProfileState })
    }, 450)
  })
}

/**
 * Upload company logo or profile image.
 *
 * Backend endpoint (suggested): POST /api/v1/vendor/profile/upload
 */
export async function uploadVendorAsset(
  type: "logo" | "profile",
  file: File
): Promise<{ url: string }> {
  return new Promise((resolve) => {
    const mockUrl = URL.createObjectURL(file)
    setTimeout(() => {
      if (type === "logo") {
        activeVendorProfileState.companyLogoUrl = mockUrl
      } else {
        activeVendorProfileState.profileImageUrl = mockUrl
      }
      resolve({ url: mockUrl })
    }, 500)
  })
}