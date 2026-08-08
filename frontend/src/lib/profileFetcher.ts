import { API_BASE_URL } from "@/lib/api"
import { fetchSavedAddresses, fetchSavedCards } from "@/lib/cartCheckoutApi"
import { fetchCustomerOrders } from "@/lib/customerOrdersApi"

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
// Mock data — fallback if backend fails.
// ---------------------------------------------------------------------------

export const mockCustomerProfile: CustomerProfileData = {
  user: {
    id: 1,
    username: "customer",
    fullName: "Customer",
    email: "customer@example.com",
    phone: "",
    avatarUrl: undefined,
  },
  addresses: [],
  paymentMethods: [],
  currentlyRented: [],
  rentingHistory: [],
  invoices: [],
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
  const stored = localStorage.getItem("user") || localStorage.getItem("customer_user")
  const user = stored ? JSON.parse(stored) : null

  if (!user) {
    throw new Error("No logged in user found")
  }

  // 1. Fetch addresses
  let addresses: UserAddress[] = []
  try {
    const fetchedAddresses = await fetchSavedAddresses()
    addresses = fetchedAddresses.map((a) => ({
      id: a.id,
      label: a.label.toLowerCase(),
      addressLine: a.street,
      city: a.city,
      state: a.state,
      zipCode: a.zipCode,
    }))
  } catch (err) {
    console.warn("Failed to fetch addresses for profile:", err)
  }

  // 2. Fetch payment methods
  let paymentMethods: PaymentMethod[] = []
  try {
    const fetchedCards = await fetchSavedCards()
    paymentMethods = fetchedCards.map((c) => ({
      id: c.id,
      type: c.brand.toUpperCase(),
      lastFour: c.cardNumberLast4,
      maskedNumber: `xxxx xxxx ${c.cardNumberLast4}`,
    }))
  } catch (err) {
    console.warn("Failed to fetch cards for profile:", err)
  }

  // 3. Fetch orders & map to rentals, history, invoices
  let currentlyRented: ProfileRentalItem[] = []
  let rentingHistory: ProfileRentalItem[] = []
  let invoices: ProfileInvoice[] = []

  try {
    const orders = await fetchCustomerOrders()
    for (const order of orders) {
      const isRented = order.status === "Active" || order.status === "Pending Pickup"
      for (const item of order.items) {
        const itemObj: ProfileRentalItem = {
          id: `${order.id}-${item.id}`,
          name: item.title,
          image: item.image,
          rentedFrom: order.startDate.replace("T", " "),
          rentedUntil: order.endDate.replace("T", " "),
          status: isRented ? "active" : "returned",
        }
        if (isRented) {
          currentlyRented.push(itemObj)
        } else {
          rentingHistory.push(itemObj)
        }
      }

      // Invoices
      invoices.push({
        id: `inv-${order.id}`,
        invoiceNumber: `INV-${order.reference.replace("ORD-", "")}`,
        amount: order.total,
        date: order.orderDate.split("T")[0],
        status: order.status === "Cancelled" ? "pending" : "paid",
      })
    }
  } catch (err) {
    console.warn("Failed to fetch orders for profile:", err)
  }

  const profileUser: CustomerProfileUser = {
    id: user.id || 1,
    username: user.email ? user.email.split("@")[0] : "customer",
    fullName: user.full_name || "Customer Account",
    email: user.email || "",
    phone: user.phone || "",
    avatarUrl: undefined,
  }

  return {
    user: profileUser,
    addresses,
    paymentMethods,
    currentlyRented,
    rentingHistory,
    invoices,
  }
}

/**
 * Fetch paginated currently rented items.
 */
export async function fetchCurrentlyRentedItems(
  offset = 0,
  limit = 4
): Promise<ProfileRentalItem[]> {
  void offset
  const profile = await fetchCustomerProfile()
  return profile.currentlyRented.slice(0, limit)
}

/**
 * Fetch paginated rental history.
 */
export async function fetchRentingHistory(
  offset = 0,
  limit = 2
): Promise<ProfileRentalItem[]> {
  void offset
  const profile = await fetchCustomerProfile()
  return profile.rentingHistory.slice(0, limit)
}

/**
 * Fetch paginated invoices.
 */
export async function fetchInvoices(offset = 0, limit = 2): Promise<ProfileInvoice[]> {
  void offset
  const profile = await fetchCustomerProfile()
  return profile.invoices.slice(0, limit)
}

