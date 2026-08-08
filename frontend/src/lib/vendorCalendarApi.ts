export type ScheduleStatus = "Available" | "Booked" | "Picked Up" | "Late Return" | "In Repair"

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

// Mock Schedule Database for Jan 2026 / Active Month
const MOCK_DAILY_SCHEDULES: Record<string, DailyScheduleItem[]> = {
  "2026-01-04": [
    {
      id: "s-401",
      orderRef: "SO0001",
      productTitle: "4K Cinema Projector Pro",
      customerName: "Smith Black",
      units: 1,
      status: "Available",
      pickupTime: "10:00 AM",
      returnTime: "06:00 PM",
      hourlyRate: 15.0,
    },
    {
      id: "s-402",
      orderRef: "SO0003",
      productTitle: "Office Laserjet Printer",
      customerName: "John Dow",
      units: 1,
      status: "Available",
      pickupTime: "11:30 AM",
      returnTime: "05:00 PM",
      hourlyRate: 8.5,
    },
    {
      id: "s-403",
      orderRef: "SO0013",
      productTitle: "MacBook Pro Studio Kit",
      customerName: "Mack William",
      units: 2,
      status: "Booked",
      pickupTime: "09:00 AM",
      returnTime: "09:00 AM (Next Day)",
      hourlyRate: 25.0,
    },
  ],
  "2026-01-05": [
    {
      id: "s-501",
      orderRef: "SO0005",
      productTitle: "Ergonomic Executive Desk",
      customerName: "Alex Vance",
      units: 2,
      status: "Picked Up",
      pickupTime: "08:00 AM",
      returnTime: "08:00 PM",
      hourlyRate: 12.0,
    },
    {
      id: "s-502",
      orderRef: "SO0008",
      productTitle: "Wireless Conference Mic Array",
      customerName: "Sarah Connor",
      units: 1,
      status: "Available",
      pickupTime: "01:00 PM",
      returnTime: "06:00 PM",
      hourlyRate: 18.0,
    },
    {
      id: "s-503",
      orderRef: "SO0010",
      productTitle: "LED Stage Light Bar",
      customerName: "Liam Neeson",
      units: 4,
      status: "Booked",
      pickupTime: "02:00 PM",
      returnTime: "11:00 PM",
      hourlyRate: 30.0,
    },
  ],
  "2026-01-06": [
    {
      id: "s-601",
      orderRef: "SO0001",
      productTitle: "Projector Pro 4K",
      customerName: "Smith Black",
      units: 1,
      status: "Available",
      pickupTime: "10:00 AM",
      returnTime: "06:00 PM",
      hourlyRate: 15.0,
    },
    {
      id: "s-602",
      orderRef: "SO0003",
      productTitle: "Multifunction Color Printer",
      customerName: "John Dow",
      units: 1,
      status: "Available",
      pickupTime: "11:00 AM",
      returnTime: "04:00 PM",
      hourlyRate: 8.5,
    },
    {
      id: "s-603",
      orderRef: "SO0013",
      productTitle: "Workstation Laptop Mack",
      customerName: "Mack",
      units: 2,
      status: "Booked",
      pickupTime: "09:00 AM",
      returnTime: "09:00 AM",
      hourlyRate: 22.0,
    },
    {
      id: "s-604",
      orderRef: "SO0014",
      productTitle: "Curved Gaming Monitor 34\"",
      customerName: "Sam",
      units: 1,
      status: "Available",
      pickupTime: "02:00 PM",
      returnTime: "08:00 PM",
      hourlyRate: 10.0,
    },
  ],
  "2026-01-07": [
    {
      id: "s-701",
      orderRef: "SO0016",
      productTitle: "DJ Sound Audio Mixer 12-Channel",
      customerName: "David Guetta",
      units: 1,
      status: "Available",
      pickupTime: "05:00 PM",
      returnTime: "02:00 AM",
      hourlyRate: 40.0,
    },
  ],
  "2026-01-11": [
    {
      id: "s-1101",
      orderRef: "SO0018",
      productTitle: "Drone Camera 4K Gimbal",
      customerName: "Peter Parker",
      units: 1,
      status: "Available",
      pickupTime: "07:00 AM",
      returnTime: "07:00 PM",
      hourlyRate: 35.0,
    },
  ],
  "2026-01-14": [
    {
      id: "s-1401",
      orderRef: "SO0001",
      productTitle: "HD Cinema Projector",
      customerName: "Smith Black",
      units: 1,
      status: "Available",
      pickupTime: "10:00 AM",
      returnTime: "06:00 PM",
      hourlyRate: 15.0,
    },
    {
      id: "s-1402",
      orderRef: "SO0003",
      productTitle: "Office Printer",
      customerName: "John Dow",
      units: 1,
      status: "Available",
      pickupTime: "11:00 AM",
      returnTime: "05:00 PM",
      hourlyRate: 8.5,
    },
    {
      id: "s-1403",
      orderRef: "SO0013",
      productTitle: "Editing Laptop",
      customerName: "Mack",
      units: 2,
      status: "Booked",
      pickupTime: "09:00 AM",
      returnTime: "09:00 AM",
      hourlyRate: 22.0,
    },
    {
      id: "s-1404",
      orderRef: "SO0014",
      productTitle: "4K Monitor Display",
      customerName: "Sam",
      units: 1,
      status: "Available",
      pickupTime: "01:00 PM",
      returnTime: "07:00 PM",
      hourlyRate: 10.0,
    },
    {
      id: "s-1405",
      orderRef: "SO0022",
      productTitle: "Wireless Audio Receiver",
      customerName: "Bruce Wayne",
      units: 2,
      status: "Late Return",
      pickupTime: "08:00 AM",
      returnTime: "04:00 PM",
      hourlyRate: 14.0,
    },
  ],
  "2026-01-21": [
    {
      id: "s-2101",
      orderRef: "SO0025",
      productTitle: "VR Headset Enterprise Bundle",
      customerName: "Tony Stark",
      units: 3,
      status: "Booked",
      pickupTime: "10:00 AM",
      returnTime: "06:00 PM",
      hourlyRate: 50.0,
    },
    {
      id: "s-2102",
      orderRef: "SO0028",
      productTitle: "Ultraportable Studio Light",
      customerName: "Steve Rogers",
      units: 2,
      status: "Available",
      pickupTime: "09:00 AM",
      returnTime: "05:00 PM",
      hourlyRate: 12.0,
    },
  ],
  "2026-01-28": [
    {
      id: "s-2801",
      orderRef: "SO0001",
      productTitle: "Projector, Smith Black",
      customerName: "Smith Black",
      units: 1,
      status: "Available",
      pickupTime: "10:00 AM",
      returnTime: "06:00 PM",
      hourlyRate: 15.0,
    },
    {
      id: "s-2802",
      orderRef: "SO0003",
      productTitle: "Printer, John Dow",
      customerName: "John Dow",
      units: 1,
      status: "Available",
      pickupTime: "11:00 AM",
      returnTime: "05:00 PM",
      hourlyRate: 8.5,
    },
    {
      id: "s-2803",
      orderRef: "SO0013",
      productTitle: "Laptop, Mack",
      customerName: "Mack",
      units: 2,
      status: "Booked",
      pickupTime: "09:00 AM",
      returnTime: "09:00 AM",
      hourlyRate: 22.0,
    },
    {
      id: "s-2804",
      orderRef: "SO0014",
      productTitle: "Monitor, Sam",
      customerName: "Sam",
      units: 1,
      status: "Available",
      pickupTime: "01:00 PM",
      returnTime: "07:00 PM",
      hourlyRate: 10.0,
    },
  ],
}

/**
 * MIMICKING API FUNCTIONS
 */

export async function fetchMonthlyCalendarEvents(
  year: number = 2026,
  month: number = 1
): Promise<Record<string, MonthDaySummary>> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const summaries: Record<string, MonthDaySummary> = {}
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

  // Generate calendar summaries for 31 days
  for (let day = 1; day <= 31; day++) {
    const dateStr = `${year}-${pad(month)}-${pad(day)}`
    const items = MOCK_DAILY_SCHEDULES[dateStr] || []

    const dots: DayEventDot[] = items.map((item) => {
      switch (item.status) {
        case "Available":
          return { color: "emerald", label: "Available" }
        case "Booked":
          return { color: "purple", label: "Booked" }
        case "Picked Up":
          return { color: "amber", label: "Picked Up" }
        case "Late Return":
          return { color: "rose", label: "Late Return" }
        default:
          return { color: "sky", label: "In Repair" }
      }
    })

    summaries[dateStr] = {
      dateStr,
      dayNumber: day,
      dots,
      scheduleCount: items.length,
    }
  }

  return summaries
}

export async function fetchDateScheduleReport(
  dateStr: string
): Promise<DailyScheduleItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return MOCK_DAILY_SCHEDULES[dateStr] || []
}
