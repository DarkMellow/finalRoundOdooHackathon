import { API_BASE_URL } from "@/lib/api"

// ---------------------------------------------------------------------------
// Types — aligned with backend models where possible; extended for UI needs.
// Backend engineer: map API responses to these shapes in fetchCustomerProfile().
// ---------------------------------------------------------------------------

export interface UserAddress {
  id: string
  label: "home" | "work" | string
  addressLine: string
  city: string
  state?: string
  zipCode: string
}

export interface PaymentMethod {
  id: string
  type: "VISA" | "MASTER CARD" | string
  lastFour: string
  /** Display string e.g. "xxxx xxxx 8549" */
  maskedNumber: string
}

export interface ProfileRentalItem {
  id: string
  name: string
  image?: string
  rentedFrom?: string
  rentedUntil?: string
  status?: "active" | "returned" | "pending"
}

export interface ProfileInvoice {
  id: string
  invoiceNumber: string
  amount: number
  date: string
  status: "paid" | "pending" | "overdue"
}

export interface CustomerProfileUser {
  id: number
  username: string
  fullName: string
  email: string
  phone: string
  avatarUrl?: string
}

export interface CustomerProfileData {
  user: CustomerProfileUser
  addresses: UserAddress[]
  paymentMethods: PaymentMethod[]
  currentlyRented: ProfileRentalItem[]
  rentingHistory: ProfileRentalItem[]
  invoices: ProfileInvoice[]
}

// ---------------------------------------------------------------------------
// Mock data — replace via fetchCustomerProfile() when backend is ready.
// ---------------------------------------------------------------------------

export const mockCustomerProfile: CustomerProfileData = {
  user: {
    id: 1,
    username: "Username",
    fullName: "Jane Doe",
    email: "dummy123@gmail.com",
    phone: "+91-9999999999",
    avatarUrl: undefined,
  },
  addresses: [
    {
      id: "addr-1",
      label: "home",
      addressLine: "Ball Streets",
      city: "London",
      state: "UK",
      zipCode: "99999",
    },
    {
      id: "addr-2",
      label: "work",
      addressLine: "Ball Streets",
      city: "London",
      state: "UK",
      zipCode: "99999",
    },
  ],
  paymentMethods: [
    {
      id: "pm-1",
      type: "VISA",
      lastFour: "8549",
      maskedNumber: "xxxx xxxx 8549",
    },
    {
      id: "pm-2",
      type: "MASTER CARD",
      lastFour: "8549",
      maskedNumber: "xxxx xxxx 8549",
    },
  ],
  currentlyRented: [
    {
      id: "rent-1",
      name: "Sony 55\" 4K Smart TV",
      image: "https://images.unsplash.com/photo-15933596723-61b019a0a2bd?auto=format&fit=crop&w=400&q=80",
      rentedFrom: "2026-07-01",
      rentedUntil: "2026-08-01",
      status: "active",
    },
    {
      id: "rent-2",
      name: "Dell XPS 15 Laptop",
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3c7b5?auto=format&fit=crop&w=400&q=80",
      rentedFrom: "2026-07-10",
      rentedUntil: "2026-09-10",
      status: "active",
    },
    {
      id: "rent-3",
      name: "Canon EOS DSLR Camera",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80",
      rentedFrom: "2026-06-15",
      rentedUntil: "2026-07-15",
      status: "active",
    },
    {
      id: "rent-4",
      name: "Herman Miller Office Chair",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80",
      rentedFrom: "2026-05-01",
      rentedUntil: "2026-11-01",
      status: "active",
    },
  ],
  rentingHistory: [
    {
      id: "hist-1",
      name: "JBL Portable Speaker",
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80",
      rentedFrom: "2026-03-01",
      rentedUntil: "2026-04-01",
      status: "returned",
    },
    {
      id: "hist-2",
      name: "GoPro Action Camera",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
      rentedFrom: "2026-01-15",
      rentedUntil: "2026-02-15",
      status: "returned",
    },
  ],
  invoices: [
    {
      id: "inv-1",
      invoiceNumber: "INV-2026-0042",
      amount: 4999,
      date: "2026-07-01",
      status: "paid",
    },
    {
      id: "inv-2",
      invoiceNumber: "INV-2026-0038",
      amount: 2499,
      date: "2026-06-15",
      status: "paid",
    },
  ],
}

function formatAddress(address: UserAddress): string {
  const parts = [address.addressLine, address.city, address.state, address.zipCode].filter(Boolean)
  return parts.join(", ")
}

/** Helper for displaying a full address string in the UI. */
export function getAddressDisplay(address: UserAddress): string {
  return formatAddress(address)
}

// ---------------------------------------------------------------------------
// API fetchers — swap mock implementation for real endpoints when ready.
// ---------------------------------------------------------------------------

/**
 * Fetch the logged-in customer's full profile dashboard data.
 *
 * Backend endpoint (suggested): GET /api/v1/customer/profile
 * Expected response shape: CustomerProfileData
 */
export async function fetchCustomerProfile(): Promise<CustomerProfileData> {
  // Uncomment when backend is ready:
  // const res = await fetch(`${API_BASE_URL}/api/v1/customer/profile`, {
  //   headers: { Authorization: `Bearer ${localStorage.getItem("customer_token")}` },
  // })
  // if (!res.ok) throw new Error("Failed to fetch profile")
  // return res.json()

  void API_BASE_URL
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCustomerProfile), 350)
  })
}

/**
 * Fetch paginated currently rented items.
 *
 * Backend endpoint (suggested): GET /api/v1/customer/rentals/active?offset=&limit=
 */
export async function fetchCurrentlyRentedItems(
  offset = 0,
  limit = 4
): Promise<ProfileRentalItem[]> {
  void offset
  void limit
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCustomerProfile.currentlyRented.slice(0, limit)), 200)
  })
}

/**
 * Fetch paginated rental history.
 *
 * Backend endpoint (suggested): GET /api/v1/customer/rentals/history?offset=&limit=
 */
export async function fetchRentingHistory(
  offset = 0,
  limit = 2
): Promise<ProfileRentalItem[]> {
  void offset
  void limit
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCustomerProfile.rentingHistory.slice(0, limit)), 200)
  })
}

/**
 * Fetch paginated invoices.
 *
 * Backend endpoint (suggested): GET /api/v1/customer/invoices?offset=&limit=
 */
export async function fetchInvoices(offset = 0, limit = 2): Promise<ProfileInvoice[]> {
  void offset
  void limit
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCustomerProfile.invoices.slice(0, limit)), 200)
  })
}
