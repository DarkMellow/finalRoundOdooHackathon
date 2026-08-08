export interface CartItem {
  id: string
  productId: string
  title: string
  brand: string
  image: string
  hourlyRate: number
  quantity: number
  variantName?: string
  savedForLater?: boolean
}

export interface CartSummary {
  items: CartItem[]
  savedItems: CartItem[]
  startDate: string // ISO string or YYYY-MM-DDTHH:mm
  endDate: string   // ISO string or YYYY-MM-DDTHH:mm
  totalHours: number
  subtotal: number
  discount: number
  couponCode?: string
  total: number
}

export interface DeliveryAddress {
  id: string
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  phone: string
  isDefault?: boolean
  label: "Home" | "Work" | "Other"
}

export interface SavedCard {
  id: string
  cardholderName: string
  cardNumberLast4: string
  expiry: string
  brand: "Visa" | "Mastercard" | "Amex"
  isDefault?: boolean
}

export interface PaymentDetails {
  method: "card" | "upi" | "cod"
  cardId?: string
  cardName?: string
  cardNumber?: string
  expiry?: string
  cvv?: string
  upiId?: string
}

// Initial default dates: Start = Now, End = 24 Hours from now
const getDefaultStartDate = (): string => {
  const now = new Date()
  now.setMinutes(0, 0, 0)
  return now.toISOString().slice(0, 16)
}

const getDefaultEndDate = (): string => {
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 1)
  endDate.setMinutes(0, 0, 0)
  return endDate.toISOString().slice(0, 16)
}

// Calculate hours between two datetime-local strings
export function calculateRentalHours(startDateStr: string, endDateStr: string): number {
  try {
    const start = new Date(startDateStr)
    const end = new Date(endDateStr)
    const diffMs = end.getTime() - start.getTime()
    if (isNaN(diffMs) || diffMs <= 0) {
      return 1 // Minimum fallback 1 hour
    }
    const hours = Math.ceil(diffMs / (1000 * 60 * 60))
    return Math.max(1, hours)
  } catch {
    return 1
  }
}

// Mock Cart Store State
let mockCartItems: CartItem[] = [
  {
    id: "cart-1",
    productId: "p1",
    title: "Ergonomic Mesh Executive Chair",
    brand: "Herman Miller Spec",
    image: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=600&q=80",
    hourlyRate: 2.5,
    quantity: 1,
    variantName: "Pro Mesh + Headrest (Dark Graphite)",
    savedForLater: false,
  },
  {
    id: "cart-2",
    productId: "p2",
    title: "4K Cinema Projector Pro",
    brand: "Sony Professional",
    image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80",
    hourlyRate: 8.0,
    quantity: 1,
    variantName: "Standard Cinema 4K Package",
    savedForLater: false,
  },
  {
    id: "cart-3",
    productId: "p3",
    title: "MacBook Pro M3 Max Studio Kit",
    brand: "Apple Enterprise",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    hourlyRate: 12.0,
    quantity: 2,
    variantName: "64GB RAM / 2TB SSD Edition",
    savedForLater: false,
  },
]

let mockAddresses: DeliveryAddress[] = [
  {
    id: "addr-1",
    fullName: "Jane Doe",
    street: "742 Evergreen Terrace",
    city: "Springfield",
    state: "IL",
    zipCode: "62701",
    phone: "+1 (555) 019-2834",
    isDefault: true,
    label: "Home",
  },
  {
    id: "addr-2",
    fullName: "Jane Doe (Office)",
    street: "100 Innovation Way, Suite 400",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    phone: "+1 (555) 012-9988",
    isDefault: false,
    label: "Work",
  },
]

let mockSavedCards: SavedCard[] = [
  {
    id: "card-1",
    cardholderName: "Jane Doe",
    cardNumberLast4: "4242",
    expiry: "12/28",
    brand: "Visa",
    isDefault: true,
  },
  {
    id: "card-2",
    cardholderName: "Jane Doe",
    cardNumberLast4: "8899",
    expiry: "09/27",
    brand: "Mastercard",
    isDefault: false,
  },
]

let currentStartDate: string = getDefaultStartDate()
let currentEndDate: string = getDefaultEndDate()
let activeDiscount: number = 0
let activeCouponCode: string | undefined = undefined

function computeCartSummary(): CartSummary {
  const activeItems = mockCartItems.filter((i) => !i.savedForLater)
  const saved = mockCartItems.filter((i) => i.savedForLater)
  const totalHours = calculateRentalHours(currentStartDate, currentEndDate)

  const subtotal = activeItems.reduce((sum, item) => {
    return sum + item.hourlyRate * totalHours * item.quantity
  }, 0)

  const total = Math.max(0, subtotal - activeDiscount)

  return {
    items: activeItems,
    savedItems: saved,
    startDate: currentStartDate,
    endDate: currentEndDate,
    totalHours,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(activeDiscount * 100) / 100,
    couponCode: activeCouponCode,
    total: Math.round(total * 100) / 100,
  }
}

/**
 * MIMICKING API FUNCTIONS
 */

export async function fetchCartSummary(): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return computeCartSummary()
}

export async function updateRentalPeriod(startDate: string, endDate: string): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  currentStartDate = startDate
  currentEndDate = endDate
  return computeCartSummary()
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  mockCartItems = mockCartItems.map((item) => {
    if (item.id === itemId) {
      return { ...item, quantity: Math.max(1, quantity) }
    }
    return item
  })
  return computeCartSummary()
}

export async function removeCartItem(itemId: string): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  mockCartItems = mockCartItems.filter((item) => item.id !== itemId)
  return computeCartSummary()
}

export async function toggleSaveForLater(itemId: string): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 100))
  mockCartItems = mockCartItems.map((item) => {
    if (item.id === itemId) {
      return { ...item, savedForLater: !item.savedForLater }
    }
    return item
  })
  return computeCartSummary()
}

export async function applyCouponCode(
  code: string
): Promise<{ success: boolean; discountAmount: number; message: string; summary: CartSummary }> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const cleanCode = code.trim().toUpperCase()

  if (cleanCode === "RENTAL10") {
    activeDiscount = 10
    activeCouponCode = "RENTAL10"
    return {
      success: true,
      discountAmount: 10,
      message: "$10 discount applied successfully!",
      summary: computeCartSummary(),
    }
  } else if (cleanCode === "SAVE20") {
    activeDiscount = 20
    activeCouponCode = "SAVE20"
    return {
      success: true,
      discountAmount: 20,
      message: "$20 discount applied successfully!",
      summary: computeCartSummary(),
    }
  }

  return {
    success: false,
    discountAmount: 0,
    message: "Invalid coupon code. Try 'RENTAL10' or 'SAVE20'.",
    summary: computeCartSummary(),
  }
}

export async function fetchSavedAddresses(): Promise<DeliveryAddress[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return [...mockAddresses]
}

export async function saveDeliveryAddress(
  address: Omit<DeliveryAddress, "id">
): Promise<DeliveryAddress[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const newAddr: DeliveryAddress = {
    ...address,
    id: `addr-${Date.now()}`,
  }
  mockAddresses = [newAddr, ...mockAddresses]
  return [...mockAddresses]
}

export async function fetchSavedCards(): Promise<SavedCard[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return [...mockSavedCards]
}

export async function saveNewCard(
  cardData: Omit<SavedCard, "id" | "cardNumberLast4"> & { cardNumber: string }
): Promise<SavedCard[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const rawNum = cardData.cardNumber.replace(/\s+/g, "")
  const last4 = rawNum.slice(-4) || "0000"

  const newCard: SavedCard = {
    id: `card-${Date.now()}`,
    cardholderName: cardData.cardholderName,
    cardNumberLast4: last4,
    expiry: cardData.expiry || "12/28",
    brand: cardData.brand || "Visa",
    isDefault: false,
  }

  mockSavedCards = [newCard, ...mockSavedCards]
  return [...mockSavedCards]
}

export async function processFinalOrder(
  addressId: string,
  paymentDetails: PaymentDetails
): Promise<{
  success: boolean
  orderId: string
  message: string
}> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
  const selectedAddr = mockAddresses.find((a) => a.id === addressId)
  const addrStr = selectedAddr ? `${selectedAddr.street}, ${selectedAddr.city}` : "Selected Address"

  return {
    success: true,
    orderId,
    message: `Order #${orderId} confirmed! Delivering to ${addrStr} via ${paymentDetails.method.toUpperCase()}.`,
  }
}
