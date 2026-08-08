export type ScheduleStatus = "Reserved" | "Booked" | "Picked Up" | "Late Return" | "In Repair"

export interface DailyScheduleItem {
  id: string
  orderRef: string
  productTitle: string
  customerName: string
  units: number
  status: ScheduleStatus
  pickupTime?: string
  returnTime?: string
  hourlyRate?: number
}

export interface DayEventDot {
  color: "emerald" | "amber" | "purple" | "rose" | "sky"
  label: string
}

export interface MonthDaySummary {
  dateStr: string // YYYY-MM-DD
  dayNumber: number
  dots: DayEventDot[]
  scheduleCount: number
}

import { getLoggedVendor } from "./api"

// Helper to load vendor orders from backend API
async function loadVendorOrders(): Promise<any[]> {
  const vendor = getLoggedVendor()
  if (!vendor) return []

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost"
      ? `http://${window.location.hostname}:8000`
      : "http://127.0.0.1:8000")

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/vendor/orders?vendor_id=${vendor.id}`)
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn("Failed to load vendor orders for calendar:", err)
  }
  return []
}

/**
 * API FUNCTIONS FOR CALENDAR AND SCHEDULER
 */

export async function fetchMonthlyCalendarEvents(
  year: number = 2026,
  month: number = 1
): Promise<Record<string, MonthDaySummary>> {
  const orders = await loadVendorOrders()
  const summaries: Record<string, MonthDaySummary> = {}
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

  // Generate calendar summaries for 31 days
  for (let day = 1; day <= 31; day++) {
    const dateStr = `${year}-${pad(month)}-${pad(day)}`
    summaries[dateStr] = {
      dateStr,
      dayNumber: day,
      dots: [],
      scheduleCount: 0,
    }
  }

  // Populate dots from orders
  for (const order of orders) {
    if (!order.startDateRaw || !order.endDateRaw) continue
    const startStr = order.startDateRaw.split(" ")[0] // YYYY-MM-DD
    const endStr = order.endDateRaw.split(" ")[0]     // YYYY-MM-DD

    // For each day of the month, see if it falls in the range [startStr, endStr]
    for (let day = 1; day <= 31; day++) {
      const dateStr = `${year}-${pad(month)}-${pad(day)}`
      if (dateStr >= startStr && dateStr <= endStr) {
        let dotColor: "emerald" | "purple" | "amber" | "rose" | "sky" = "sky"
        let dotStatus: string = "In Repair"

        if (order.status === "Reserved") {
          dotColor = "emerald"
          dotStatus = "Reserved"
        } else if (order.status === "Quotation") {
          dotColor = "purple"
          dotStatus = "Booked"
        } else if (order.status === "Picked Up") {
          dotColor = "amber"
          dotStatus = "Picked Up"
        } else if (order.status === "Late Return" || order.status === "Late pickup") {
          dotColor = "rose"
          dotStatus = "Late Return"
        }

        summaries[dateStr].dots.push({
          color: dotColor,
          label: dotStatus,
        })
        summaries[dateStr].scheduleCount++
      }
    }
  }

  return summaries
}

export async function fetchDateScheduleReport(
  dateStr: string
): Promise<DailyScheduleItem[]> {
  const orders = await loadVendorOrders()
  const items: DailyScheduleItem[] = []

  for (const order of orders) {
    if (!order.startDateRaw || !order.endDateRaw) continue
    const startStr = order.startDateRaw.split(" ")[0]
    const endStr = order.endDateRaw.split(" ")[0]

    // If dateStr falls in range
    if (dateStr >= startStr && dateStr <= endStr) {
      let scheduleStatus: ScheduleStatus = "Reserved"
      if (order.status === "Reserved") {
        scheduleStatus = "Reserved"
      } else if (order.status === "Quotation") {
        scheduleStatus = "Booked"
      } else if (order.status === "Picked Up") {
        scheduleStatus = "Picked Up"
      } else if (order.status === "Late Return" || order.status === "Late pickup") {
        scheduleStatus = "Late Return"
      } else if (order.status === "Cancelled") {
        continue // Skip cancelled orders
      }

      items.push({
        id: `sched-${order.id}`,
        orderRef: order.reference,
        productTitle: order.item,
        customerName: order.customer,
        units: 1,
        status: scheduleStatus,
        pickupTime: order.pickupDate.split(", ")[1] || "10:00 AM",
        returnTime: order.returnDate.split(", ")[1] || "06:00 PM",
      })
    }
  }

  return items
}
