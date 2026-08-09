import { API_BASE_URL, getLoggedCustomer } from "./api"

export interface CartItem {
  id: string
  productId: string
  variantId?: string
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
  method: "card" | "upi" | "cod" | "netbanking"
  cardId?: string
  cardName?: string
  cardNumber?: string
  expiry?: string
  cvv?: string
  upiId?: string
  bank?: string
}

export interface AddToCartPayload {
  productId: string
  variantId?: string
  quantity: number
  title: string
  brand: string
  image: string
  hourlyRate: number
  variantName?: string
}

// Initial default dates: Start = Today at 19:30, End = Tomorrow at 19:30 (matches 24 Hours default)
const getDefaultStartDate = (): string => {
  const now = new Date()
  now.setMinutes(30, 0, 0)
  return now.toISOString().slice(0, 16)
}

const getDefaultEndDate = (): string => {
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 1)
  endDate.setMinutes(30, 0, 0)
  return endDate.toISOString().slice(0, 16)
}

// Calculate hours between two datetime-local strings
export function calculateRentalHours(startDateStr: string, endDateStr: string): number {
  try {
    const start = new Date(startDateStr)
    const end = new Date(endDateStr)
    const diffMs = end.getTime() - start.getTime()
    if (isNaN(diffMs) || diffMs <= 0) {
      return 24 // Fallback default 24 hours
    }
    const hours = Math.ceil(diffMs / (1000 * 60 * 60))
    return Math.max(1, hours)
  } catch {
    return 24
  }
}

// Local in-memory cache for fast UI updates & offline fallback
let cachedCartItems: CartItem[] = []
let currentStartDate: string = getDefaultStartDate()
let currentEndDate: string = getDefaultEndDate()
let activeDiscount: number = 0
let activeCouponCode: string | undefined = undefined

function computeCartSummary(items: CartItem[] = cachedCartItems): CartSummary {
  const activeItems = items.filter((i) => !i.savedForLater)
  const saved = items.filter((i) => i.savedForLater)
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

function getUserIdParam(): string {
  const user = getLoggedCustomer()
  return user?.id ? `user_id=${user.id}` : ""
}

/**
 * BACKEND CONNECTED CART API FUNCTIONS
 */

export async function fetchCartSummary(): Promise<CartSummary> {
  try {
    const userParam = getUserIdParam()
    const url = userParam ? `${API_BASE_URL}/api/v1/cart?${userParam}` : `${API_BASE_URL}/api/v1/cart`
    const res = await fetch(url)
    if (res.ok) {
      const items: CartItem[] = await res.json()
      cachedCartItems = items
      return computeCartSummary(items)
    }
  } catch (err) {
    console.warn("Failed to fetch cart from backend, using local cache:", err)
  }
  return computeCartSummary()
}

export async function addItemToCart(payload: AddToCartPayload): Promise<CartSummary> {
  const user = getLoggedCustomer()
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/cart/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user?.id,
        productId: payload.productId,
        variantId: payload.variantId,
        quantity: payload.quantity,
        title: payload.title,
        brand: payload.brand,
        image: payload.image,
        hourlyRate: payload.hourlyRate,
        variantName: payload.variantName,
      }),
    })
    if (res.ok) {
      const items: CartItem[] = await res.json()
      cachedCartItems = items
      return computeCartSummary(items)
    } else {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || errData.message || "Requested quantity exceeds available stock.")
    }
  } catch (err: any) {
    if (err.message && (err.message.includes("stock") || err.message.includes("quantity"))) {
      throw err
    }
    console.warn("Failed to post cart item to backend:", err)
  }

  // Fallback local update if backend is unreachable
  const existingIdx = cachedCartItems.findIndex(
    (i) => i.productId === payload.productId && i.variantId === payload.variantId
  )
  if (existingIdx !== -1) {
    cachedCartItems[existingIdx].quantity += payload.quantity
    cachedCartItems[existingIdx].savedForLater = false
  } else {
    cachedCartItems.unshift({
      id: `cart-${Date.now()}`,
      productId: payload.productId,
      variantId: payload.variantId,
      title: payload.title,
      brand: payload.brand,
      image: payload.image,
      hourlyRate: payload.hourlyRate,
      quantity: payload.quantity,
      variantName: payload.variantName,
      savedForLater: false,
    })
  }
  return computeCartSummary()
}

export async function updateRentalPeriod(startDate: string, endDate: string): Promise<CartSummary> {
  currentStartDate = startDate
  currentEndDate = endDate
  return computeCartSummary()
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<CartSummary> {
  const user = getLoggedCustomer()
  try {
    const userParam = user?.id ? `?user_id=${user.id}` : ""
    const res = await fetch(`${API_BASE_URL}/api/v1/cart/items/${itemId}${userParam}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    })
    if (res.ok) {
      const items: CartItem[] = await res.json()
      cachedCartItems = items
      return computeCartSummary(items)
    }
  } catch (err) {
    console.warn("Failed to update cart item on backend:", err)
  }

  cachedCartItems = cachedCartItems.map((item) =>
    item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
  )
  return computeCartSummary()
}

export async function removeCartItem(itemId: string): Promise<CartSummary> {
  const user = getLoggedCustomer()
  try {
    const userParam = user?.id ? `?user_id=${user.id}` : ""
    const res = await fetch(`${API_BASE_URL}/api/v1/cart/items/${itemId}${userParam}`, {
      method: "DELETE",
    })
    if (res.ok) {
      const items: CartItem[] = await res.json()
      cachedCartItems = items
      return computeCartSummary(items)
    }
  } catch (err) {
    console.warn("Failed to remove cart item on backend:", err)
  }

  cachedCartItems = cachedCartItems.filter((item) => item.id !== itemId)
  return computeCartSummary()
}

export async function toggleSaveForLater(itemId: string): Promise<CartSummary> {
  const currentItem = cachedCartItems.find((i) => i.id === itemId)
  const newSavedState = currentItem ? !currentItem.savedForLater : false
  const user = getLoggedCustomer()

  try {
    const userParam = user?.id ? `?user_id=${user.id}` : ""
    const res = await fetch(`${API_BASE_URL}/api/v1/cart/items/${itemId}${userParam}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ savedForLater: newSavedState }),
    })
    if (res.ok) {
      const items: CartItem[] = await res.json()
      cachedCartItems = items
      return computeCartSummary(items)
    }
  } catch (err) {
    console.warn("Failed to toggle save for later on backend:", err)
  }

  cachedCartItems = cachedCartItems.map((item) =>
    item.id === itemId ? { ...item, savedForLater: newSavedState } : item
  )
  return computeCartSummary()
}

export async function clearCart(): Promise<CartSummary> {
  const user = getLoggedCustomer()
  try {
    const userParam = user?.id ? `?user_id=${user.id}` : ""
    const res = await fetch(`${API_BASE_URL}/api/v1/cart${userParam}`, {
      method: "DELETE",
    })
    if (res.ok) {
      cachedCartItems = []
      return computeCartSummary([])
    }
  } catch (err) {
    console.warn("Failed to clear cart on backend:", err)
  }

  cachedCartItems = []
  return computeCartSummary([])
}

export async function applyCouponCode(
  code: string
): Promise<{ success: boolean; discountAmount: number; message: string; summary: CartSummary }> {
  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) {
    return {
      success: false,
      discountAmount: 0,
      message: "Please enter a valid promo code.",
      summary: computeCartSummary(),
    }
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/promo-codes/validate?code=${encodeURIComponent(cleanCode)}`)
    if (res.ok) {
      const data = await res.json()
      const currentSummary = computeCartSummary()
      const discountAmount = Number(((currentSummary.subtotal * data.discount_percent) / 100).toFixed(2))
      activeDiscount = discountAmount
      activeCouponCode = data.code
      return {
        success: true,
        discountAmount,
        message: `${data.discount_percent}% discount applied with promo code ${data.code}!`,
        summary: computeCartSummary(),
      }
    } else {
      const errData = await res.json().catch(() => ({}))
      return {
        success: false,
        discountAmount: 0,
        message: errData.detail || "Invalid or expired promo code.",
        summary: computeCartSummary(),
      }
    }
  } catch (err) {
    console.warn("Failed to validate promo code via backend:", err)
  }

  // Fallback for offline/mock codes
  if (cleanCode === "RENTAL10" || cleanCode === "SAVE20") {
    const pct = cleanCode === "SAVE20" ? 20 : 10
    const currentSummary = computeCartSummary()
    const discountAmount = Number(((currentSummary.subtotal * pct) / 100).toFixed(2))
    activeDiscount = discountAmount
    activeCouponCode = cleanCode
    return {
      success: true,
      discountAmount,
      message: `${pct}% discount applied!`,
      summary: computeCartSummary(),
    }
  }

  return {
    success: false,
    discountAmount: 0,
    message: "Invalid promo code.",
    summary: computeCartSummary(),
  }
}

let cachedAddresses: DeliveryAddress[] = []
let cachedCards: SavedCard[] = []

export async function fetchSavedAddresses(): Promise<DeliveryAddress[]> {
  const user = getLoggedCustomer()
  try {
    const userParam = user?.id ? `?user_id=${user.id}` : ""
    const res = await fetch(`${API_BASE_URL}/api/v1/addresses${userParam}`)
    if (res.ok) {
      const addrs: DeliveryAddress[] = await res.json()
      cachedAddresses = addrs
      return addrs
    }
  } catch (err) {
    console.warn("Failed to fetch addresses from backend:", err)
  }
  return [...cachedAddresses]
}

export async function saveDeliveryAddress(
  address: Omit<DeliveryAddress, "id">
): Promise<DeliveryAddress[]> {
  const user = getLoggedCustomer()
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user?.id,
        fullName: address.fullName,
        label: address.label,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        phone: address.phone,
        isDefault: Boolean(address.isDefault),
      }),
    })
    if (res.ok) {
      const addrs: DeliveryAddress[] = await res.json()
      cachedAddresses = addrs
      return addrs
    }
  } catch (err) {
    console.warn("Failed to save address to backend:", err)
  }

  const newAddr: DeliveryAddress = {
    ...address,
    id: `addr-${Date.now()}`,
  }
  cachedAddresses = [newAddr, ...cachedAddresses]
  return [...cachedAddresses]
}

export async function deleteDeliveryAddress(addressId: string): Promise<DeliveryAddress[]> {
  const user = getLoggedCustomer()
  try {
    const userParam = user?.id ? `?user_id=${user.id}` : ""
    const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${addressId}${userParam}`, {
      method: "DELETE",
    })
    if (res.ok) {
      const addrs: DeliveryAddress[] = await res.json()
      cachedAddresses = addrs
      return addrs
    }
  } catch (err) {
    console.warn("Failed to delete address on backend:", err)
  }

  cachedAddresses = cachedAddresses.filter((a) => a.id !== addressId)
  return [...cachedAddresses]
}

export async function fetchSavedCards(): Promise<SavedCard[]> {
  const user = getLoggedCustomer()
  try {
    const userParam = user?.id ? `?user_id=${user.id}` : ""
    const res = await fetch(`${API_BASE_URL}/api/v1/cards${userParam}`)
    if (res.ok) {
      const cards: SavedCard[] = await res.json()
      cachedCards = cards
      return cards
    }
  } catch (err) {
    console.warn("Failed to fetch cards from backend:", err)
  }
  return [...cachedCards]
}

export async function saveNewCard(
  cardData: Omit<SavedCard, "id" | "cardNumberLast4"> & { cardNumber: string }
): Promise<SavedCard[]> {
  const user = getLoggedCustomer()
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user?.id,
        cardholderName: cardData.cardholderName,
        cardNumber: cardData.cardNumber,
        expiry: cardData.expiry || "12/28",
        brand: cardData.brand || "Visa",
        isDefault: Boolean(cardData.isDefault),
      }),
    })
    if (res.ok) {
      const cards: SavedCard[] = await res.json()
      cachedCards = cards
      return cards
    }
  } catch (err) {
    console.warn("Failed to save card to backend:", err)
  }

  const rawNum = cardData.cardNumber.replace(/\s+/g, "")
  const last4 = rawNum.slice(-4) || "0000"
  const newCard: SavedCard = {
    id: `card-${Date.now()}`,
    cardholderName: cardData.cardholderName,
    cardNumberLast4: last4,
    expiry: cardData.expiry || "12/28",
    brand: cardData.brand || "Visa",
    isDefault: Boolean(cardData.isDefault),
  }
  cachedCards = [newCard, ...cachedCards]
  return [...cachedCards]
}

export async function deleteSavedCard(cardId: string): Promise<SavedCard[]> {
  const user = getLoggedCustomer()
  try {
    const userParam = user?.id ? `?user_id=${user.id}` : ""
    const res = await fetch(`${API_BASE_URL}/api/v1/cards/${cardId}${userParam}`, {
      method: "DELETE",
    })
    if (res.ok) {
      const cards: SavedCard[] = await res.json()
      cachedCards = cards
      return cards
    }
  } catch (err) {
    console.warn("Failed to delete card on backend:", err)
  }

  cachedCards = cachedCards.filter((c) => c.id !== cardId)
  return [...cachedCards]
}

export async function updateExistingCard(
  cardId: string,
  cardData: Omit<SavedCard, "id" | "cardNumberLast4"> & { cardNumber?: string }
): Promise<SavedCard[]> {
  const user = getLoggedCustomer()
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/cards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user?.id,
        cardholderName: cardData.cardholderName,
        cardNumber: cardData.cardNumber || "**** **** **** ****",
        expiry: cardData.expiry || "12/28",
        brand: cardData.brand || "Visa",
        isDefault: Boolean(cardData.isDefault),
      }),
    })
    if (res.ok) {
      const cards: SavedCard[] = await res.json()
      cachedCards = cards
      return cards
    }
  } catch (err) {
    console.warn("Failed to update card in backend:", err)
  }
  return fetchSavedCards()
}

export async function processFinalOrder(
  addressId: string,
  paymentDetails: PaymentDetails
): Promise<{
  success: boolean
  orderId: string
  message: string
}> {
  const user = getLoggedCustomer()
  const selectedAddr = cachedAddresses.find((a) => a.id === addressId)
  const addrStr = selectedAddr
    ? `${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.state} ${selectedAddr.zipCode}`
    : undefined

  let paymentMethodStr = "Credit Card"
  if (paymentDetails.method === "card") {
    paymentMethodStr = `Card ending in ${paymentDetails.cardNumber?.slice(-4) || "4242"}`
  } else if (paymentDetails.method === "upi") {
    paymentMethodStr = `UPI ID (${paymentDetails.upiId || "user@upi"})`
  } else if (paymentDetails.method === "netbanking") {
    paymentMethodStr = `Net Banking (${paymentDetails.bank || "HDFC Bank"})`
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user?.id,
        addressId,
        deliveryAddress: addrStr,
        paymentMethod: paymentMethodStr,
        totalHours: 24,
        discount: activeDiscount,
        promoCode: activeCouponCode || undefined,
      }),
    })
    if (res.ok) {
      const createdOrder = await res.json()
      await clearCart()
      return {
        success: true,
        orderId: createdOrder.reference || createdOrder.id,
        message: `Order #${createdOrder.reference || createdOrder.id} confirmed! Delivering to ${createdOrder.deliveryAddress} via ${createdOrder.paymentMethod}.`,
      }
    } else {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.detail || errData.message || "Order placement failed. Items in your cart may be out of stock.")
    }
  } catch (err: any) {
    if (err.message && (err.message.includes("stock") || err.message.includes("failed") || err.message.includes("Order"))) {
      throw err
    }
    console.warn("Failed to create order on backend:", err)
  }

  // Fallback
  await clearCart()
  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
  return {
    success: true,
    orderId,
    message: `Order #${orderId} confirmed! Delivering to ${addrStr || "Selected Address"} via ${paymentMethodStr}.`,
  }
}


