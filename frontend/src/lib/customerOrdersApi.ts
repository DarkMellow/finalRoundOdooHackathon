import { API_BASE_URL, getLoggedCustomer } from "./api"

export interface CustomerOrderItem {
  id: string
  productId: string
  title: string
  brand: string
  image: string
  hourlyRate: number
  quantity: number
  variantName?: string
}

export type OrderStatus = "Active" | "Pending Pickup" | "Completed" | "Returned" | "Cancelled"

export interface CustomerOrder {
  id: string
  reference: string
  orderDate: string
  status: OrderStatus
  startDate: string
  endDate: string
  totalHours: number
  subtotal: number
  discount: number
  total: number
  items: CustomerOrderItem[]
  deliveryAddress: string
  paymentMethod: string
  invoiceUrl?: string
}

export async function fetchCustomerOrders(statusFilter?: string): Promise<CustomerOrder[]> {
  const user = getLoggedCustomer()
  try {
    const params = new URLSearchParams()
    if (user?.id) params.append("user_id", String(user.id))
    if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)
    const res = await fetch(`${API_BASE_URL}/api/v1/orders?${params.toString()}`)
    if (res.ok) {
      const data: CustomerOrder[] = await res.json()
      return data
    }
  } catch (err) {
    console.warn("Failed to fetch customer orders from backend:", err)
  }
  return []
}

export async function fetchCustomerOrderById(orderId: string): Promise<CustomerOrder | null> {
  const user = getLoggedCustomer()
  try {
    const userParam = user?.id ? `?user_id=${user.id}` : ""
    const res = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}${userParam}`)
    if (res.ok) {
      const data: CustomerOrder = await res.json()
      return data
    }
  } catch (err) {
    console.warn("Failed to fetch order by ID:", err)
  }
  return null
}

export async function cancelCustomerOrder(orderId: string): Promise<{
  success: boolean
  message: string
  orders: CustomerOrder[]
}> {
  const user = getLoggedCustomer()
  try {
    const userParam = user?.id ? `?user_id=${user.id}` : ""
    const res = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/cancel${userParam}`, {
      method: "POST",
    })
    if (res.ok) {
      const updatedOrders: CustomerOrder[] = await res.json()
      return {
        success: true,
        message: `Order #${orderId} reservation has been successfully cancelled and refunded.`,
        orders: updatedOrders,
      }
    }
  } catch (err) {
    console.warn("Failed to cancel order on backend:", err)
  }
  return {
    success: false,
    message: `Failed to cancel order #${orderId}`,
    orders: [],
  }
}

