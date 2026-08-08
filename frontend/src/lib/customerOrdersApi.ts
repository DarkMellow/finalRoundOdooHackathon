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

// Initial Mock Customer Orders Data
let MOCK_CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: "ord-101",
    reference: "ORD-849201",
    orderDate: "2026-08-08T14:30:00Z",
    status: "Active",
    startDate: "2026-08-08T16:00",
    endDate: "2026-08-11T16:00",
    totalHours: 72,
    subtotal: 396.0,
    discount: 10.0,
    total: 386.0,
    deliveryAddress: "742 Evergreen Terrace, Springfield, IL 62701",
    paymentMethod: "Visa ending in 4242",
    items: [
      {
        id: "item-1",
        productId: "p1",
        title: "Ergonomic Mesh Executive Chair",
        brand: "Herman Miller Spec",
        image: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=600&q=80",
        hourlyRate: 2.5,
        quantity: 1,
        variantName: "Pro Mesh + Headrest (Dark Graphite)",
      },
      {
        id: "item-2",
        productId: "p2",
        title: "4K Cinema Projector Pro",
        brand: "Sony Professional",
        image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80",
        hourlyRate: 3.0,
        quantity: 1,
        variantName: "Standard Cinema 4K Package",
      },
    ],
  },
  {
    id: "ord-102",
    reference: "ORD-773194",
    orderDate: "2026-08-01T09:15:00Z",
    status: "Pending Pickup",
    startDate: "2026-08-10T10:00",
    endDate: "2026-08-12T10:00",
    totalHours: 48,
    subtotal: 576.0,
    discount: 20.0,
    total: 556.0,
    deliveryAddress: "100 Innovation Way, Suite 400, Chicago, IL 60601",
    paymentMethod: "Mastercard ending in 8899",
    items: [
      {
        id: "item-3",
        productId: "p3",
        title: "MacBook Pro M3 Max Studio Kit",
        brand: "Apple Enterprise",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
        hourlyRate: 12.0,
        quantity: 1,
        variantName: "64GB RAM / 2TB SSD Edition",
      },
    ],
  },
  {
    id: "ord-103",
    reference: "ORD-610283",
    orderDate: "2026-07-20T11:00:00Z",
    status: "Completed",
    startDate: "2026-07-21T09:00",
    endDate: "2026-07-23T09:00",
    totalHours: 48,
    subtotal: 240.0,
    discount: 0,
    total: 240.0,
    deliveryAddress: "742 Evergreen Terrace, Springfield, IL 62701",
    paymentMethod: "Visa ending in 4242",
    items: [
      {
        id: "item-4",
        productId: "p4",
        title: "Studio Lighting Softbox Kit",
        brand: "Godox Professional",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        hourlyRate: 2.5,
        quantity: 2,
        variantName: "Dual Softbox 500W Bundle",
      },
    ],
  },
  {
    id: "ord-104",
    reference: "ORD-509122",
    orderDate: "2026-07-05T16:45:00Z",
    status: "Cancelled",
    startDate: "2026-07-06T12:00",
    endDate: "2026-07-07T12:00",
    totalHours: 24,
    subtotal: 150.0,
    discount: 0,
    total: 0.0,
    deliveryAddress: "742 Evergreen Terrace, Springfield, IL 62701",
    paymentMethod: "Refunded to Visa 4242",
    items: [
      {
        id: "item-5",
        productId: "p5",
        title: "Wireless Conference Speakerphone",
        brand: "Jabra Speak",
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80",
        hourlyRate: 6.25,
        quantity: 1,
        variantName: "Bluetooth 360 Mic Edition",
      },
    ],
  },
]

/**
 * MIMICKING API FUNCTIONS
 * 
 * Backend engineers can replace internal mock operations with fetch / axios calls
 * to actual REST/GraphQL endpoints without modifying frontend components.
 */

export async function fetchCustomerOrders(statusFilter?: string): Promise<CustomerOrder[]> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  if (!statusFilter || statusFilter === "all") {
    return [...MOCK_CUSTOMER_ORDERS]
  }

  if (statusFilter === "active") {
    return MOCK_CUSTOMER_ORDERS.filter(
      (o) => o.status === "Active" || o.status === "Pending Pickup"
    )
  }

  if (statusFilter === "completed") {
    return MOCK_CUSTOMER_ORDERS.filter(
      (o) => o.status === "Completed" || o.status === "Returned"
    )
  }

  if (statusFilter === "cancelled") {
    return MOCK_CUSTOMER_ORDERS.filter((o) => o.status === "Cancelled")
  }

  return [...MOCK_CUSTOMER_ORDERS]
}

export async function fetchCustomerOrderById(orderId: string): Promise<CustomerOrder | null> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const found = MOCK_CUSTOMER_ORDERS.find((o) => o.id === orderId || o.reference === orderId)
  return found ? { ...found } : null
}

export async function cancelCustomerOrder(orderId: string): Promise<{
  success: boolean
  message: string
  orders: CustomerOrder[]
}> {
  await new Promise((resolve) => setTimeout(resolve, 250))

  MOCK_CUSTOMER_ORDERS = MOCK_CUSTOMER_ORDERS.map((order) => {
    if (order.id === orderId || order.reference === orderId) {
      return { ...order, status: "Cancelled" as OrderStatus, total: 0 }
    }
    return order
  })

  return {
    success: true,
    message: `Order #${orderId} reservation has been successfully cancelled and refunded.`,
    orders: [...MOCK_CUSTOMER_ORDERS],
  }
}
