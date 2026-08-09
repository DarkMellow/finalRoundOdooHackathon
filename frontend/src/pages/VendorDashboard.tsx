import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { getLoggedVendor, type VendorUser } from "@/lib/api"
import { VendorCalendar } from "@/components/vendor/VendorCalendar"
import {
  Building2,
  Search,
  List,
  LayoutGrid,
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  Plus,
  Calendar,
  Package,
  TrendingUp,
  Award,
  ShoppingBag,
  DollarSign,
  Edit2,
  Check,
  X,
  Printer,
  Download,
} from "lucide-react"

// Types
type ViewMode = "list" | "kanban" | "calendar"
type StatusFilter = "all" | "today" | "pickup" | "return" | "late"

interface Order {
  id: string
  reference: string
  customer: string
  item: string
  status: "Reserved" | "Picked Up" | "Late pickup" | "Late Return" | "Quotation" | "Cancelled"
  pickupDate: string
  returnDate: string
  total: number
  invoiceStatus: "Invoiced" | "Confirmed" | "Quotation Sent" | "Nothing to Invoice"
}

// Rich Dummy Orders Data matching the wireframe
export const INITIAL_ORDERS: Order[] = [
  {
    id: "1",
    reference: "S00001",
    customer: "Wood Corner",
    item: "Smart TV 65\"",
    status: "Reserved",
    pickupDate: "Jul 6, 6:30pm",
    returnDate: "Jul 10, 6:30pm",
    total: 1520,
    invoiceStatus: "Invoiced",
  },
  {
    id: "2",
    reference: "S00005",
    customer: "Smith",
    item: "4K Projector Pro",
    status: "Picked Up",
    pickupDate: "Jul 10, 6:30pm",
    returnDate: "Jul 10, 8:30pm",
    total: 1520,
    invoiceStatus: "Confirmed",
  },
  {
    id: "3",
    reference: "S00010",
    customer: "Mark wood",
    item: "Laserjet Printer",
    status: "Late pickup",
    pickupDate: "Jul 6, 6:30pm",
    returnDate: "Jul 10, 6:30pm",
    total: 1520,
    invoiceStatus: "Invoiced",
  },
  {
    id: "4",
    reference: "S00012",
    customer: "Alex",
    item: "Luxury SUV Rental",
    status: "Quotation",
    pickupDate: "Jul 3, 9:00pm",
    returnDate: "Jul 11, 9:00am",
    total: 1520,
    invoiceStatus: "Quotation Sent",
  },
  {
    id: "5",
    reference: "S00020",
    customer: "Sam",
    item: "Gaming Setup Tier 1",
    status: "Cancelled",
    pickupDate: "Jul 3, 9:00pm",
    returnDate: "Jul 11, 9:00am",
    total: 1520,
    invoiceStatus: "Nothing to Invoice",
  },
  {
    id: "6",
    reference: "S00008",
    customer: "Alex Johnson",
    item: "EV Sedan",
    status: "Quotation",
    pickupDate: "Jul 8, 10:00am",
    returnDate: "Jul 12, 5:00pm",
    total: 775,
    invoiceStatus: "Quotation Sent",
  },
  {
    id: "7",
    reference: "S00011",
    customer: "Mark wood",
    item: "Color Office Printer",
    status: "Reserved",
    pickupDate: "Jul 9, 2:00pm",
    returnDate: "Jul 15, 6:00pm",
    total: 150,
    invoiceStatus: "Confirmed",
  },
  {
    id: "8",
    reference: "S00013",
    customer: "Smith",
    item: "Console Gaming Set",
    status: "Late Return",
    pickupDate: "Jul 4, 11:00am",
    returnDate: "Jul 8, 11:00am",
    total: 340,
    invoiceStatus: "Invoiced",
  },
]

export function VendorDashboard() {
  const navigate = useNavigate()
  const [loggedVendor, setLoggedVendor] = useState<VendorUser | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all")
  const [activeNavTab, setActiveNavTab] = useState<"dashboard" | "products" | "reports">("dashboard")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [dateRange, setDateRange] = useState("Last 7 Days")
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [storeTarget, setStoreTarget] = useState<number>(10000)

  const fetchStoreTarget = async (vendorId?: number) => {
    const API_BASE_URL =
      import.meta.env.VITE_SERVER_URL ||
      (typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? `http://${window.location.hostname}:8000`
        : "http://127.0.0.1:8000")
    try {
      const param = vendorId ? `?vendor_id=${vendorId}` : ""
      const res = await fetch(`${API_BASE_URL}/api/v1/vendor/target${param}`)
      if (res.ok) {
        const data = await res.json()
        setStoreTarget(data.targetValue)
      }
    } catch (err) {
      console.warn("Failed to fetch store target:", err)
    }
  }

  const fetchOrders = async (vendorId?: number) => {
    const API_BASE_URL =
      import.meta.env.VITE_SERVER_URL ||
      (typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? `http://${window.location.hostname}:8000`
        : "http://127.0.0.1:8000")
    try {
      const param = vendorId ? `?vendor_id=${vendorId}` : ""
      const res = await fetch(`${API_BASE_URL}/api/v1/vendor/orders${param}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (err) {
      console.warn("Failed to fetch vendor orders:", err)
    }
  }

  // Load logged vendor profile
  useEffect(() => {
    const vendor = getLoggedVendor()
    if (!vendor) {
      navigate("/vendor/signin")
      return
    }
    setLoggedVendor(vendor)
    fetchOrders(vendor.id)
    fetchStoreTarget(vendor.id)
  }, [navigate])

  // Filter orders by status & search query
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.item.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeFilter === "today") {
      const currentMonth = new Date().toLocaleString("en-US", { month: "short" })
      return order.pickupDate.includes(currentMonth) || order.pickupDate.includes("Today")
    }
    if (activeFilter === "pickup") return order.status === "Reserved" || order.status === "Late pickup"
    if (activeFilter === "return") return order.status === "Picked Up"
    if (activeFilter === "late") return order.status === "Late pickup" || order.status === "Late Return"

    return true
  })

  const sales = orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + o.total, 0)
  const lateFees = Math.round(sales * 0.1)
  const deposit = Math.round(sales * 0.2)

  const currentMonthName = new Date().toLocaleString("en-US", { month: "short" })
  const todayCount = orders.filter((o) => o.pickupDate.includes(currentMonthName) || o.pickupDate.includes("Today")).length
  const pickupCount = orders.filter((o) => o.status === "Reserved" || o.status === "Late pickup").length
  const returnCount = orders.filter((o) => o.status === "Picked Up").length
  const lateCount = orders.filter((o) => o.status === "Late pickup" || o.status === "Late Return").length

  // Select all checkbox handler
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(filteredOrders.map((o) => o.id))
    } else {
      setSelectedOrders([])
    }
  }

  // Select individual row checkbox handler
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, id])
    } else {
      setSelectedOrders(selectedOrders.filter((item) => item !== id))
    }
  }

  // Get status pill color styling for light theme
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Reserved":
        return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "Picked Up":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "Late pickup":
      case "Late Return":
        return "bg-rose-100 text-rose-800 border-rose-300"
      case "Quotation":
        return "bg-sky-100 text-sky-800 border-sky-300"
      case "Cancelled":
        return "bg-slate-200 text-slate-700 border-slate-300"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  // Get invoice status badge styling for light theme
  const getInvoiceStatusBadge = (invoiceStatus: Order["invoiceStatus"]) => {
    switch (invoiceStatus) {
      case "Invoiced":
        return "bg-sky-600 text-white font-medium shadow-xs"
      case "Confirmed":
        return "bg-emerald-600 text-white font-medium shadow-xs"
      case "Quotation Sent":
        return "bg-purple-600 text-white font-medium shadow-xs"
      case "Nothing to Invoice":
        return "bg-slate-100 text-slate-600 font-normal border border-slate-300"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* ========================================================================= */}
      {/* TOP HEADER NAVIGATION (VENDOR DASHBOARD) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 shadow-xs">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
          {/* Left Brand + Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/vendor/dashboard"
              onClick={() => {
                setActiveNavTab("dashboard")
                setViewMode("list")
              }}
              className="flex items-center gap-2 group"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
                <Building2 className="size-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">EasyRental</span>
            </Link>

            <nav className="flex items-center space-x-1 sm:space-x-2 text-xs font-medium">
              {[
                { id: "dashboard", label: "Dashboard" },
                { id: "products", label: "Products" },
                { id: "reports", label: "Reports" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "products") {
                      navigate("/vendor/products")
                    } else if (tab.id === "dashboard") {
                      setActiveNavTab("dashboard")
                      setViewMode("list")
                    } else {
                      setActiveNavTab(tab.id as any)
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    activeNavTab === tab.id
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Profile Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-2.5 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">
                {loggedVendor?.full_name ? loggedVendor.full_name.slice(0, 2).toUpperCase() : "VD"}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                {loggedVendor?.vendor_profile?.company_name || loggedVendor?.full_name || "Vendor Admin"}
              </span>
              <ChevronDown className="size-3.5 text-slate-500" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl p-2 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-900">{loggedVendor?.full_name || "Vendor Admin"}</p>
                  <p className="text-[11px] text-slate-500">{loggedVendor?.email || "vendor@easyrental.com"}</p>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      alert("Vendor settings page")
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors font-medium text-left"
                  >
                    <SettingsIcon className="size-4 text-slate-500" />
                    <span>Store Settings</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false)
                      navigate("/vendor/signin")
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-medium text-left"
                  >
                    <LogOut className="size-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN DASHBOARD CONTENT */}
      {/* ========================================================================= */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 space-y-6">
        {activeNavTab === "reports" ? (
          <VendorReportsView
            orders={orders}
            sales={sales}
            storeTarget={storeTarget}
            onTargetUpdate={async (newVal) => {
              const API_BASE_URL =
                import.meta.env.VITE_SERVER_URL ||
                (typeof window !== "undefined" && window.location.hostname !== "localhost"
                  ? `http://${window.location.hostname}:8000`
                  : "http://127.0.0.1:8000")
              try {
                const res = await fetch(`${API_BASE_URL}/api/v1/vendor/target`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    targetValue: newVal,
                    vendor_id: loggedVendor?.id,
                  }),
                })
                if (res.ok) {
                  const data = await res.json()
                  setStoreTarget(data.targetValue)
                }
              } catch (err) {
                console.error("Failed to update target:", err)
              }
            }}
          />
        ) : (
          <>
            {/* Top Control Bar: Title + Actions + Search & View Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Rental Sales Orders</span>
                  <button
                    onClick={() => setActiveFilter("all")}
                    className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-bold text-slate-700"
                  >
                    {orders.length}
                  </button>
                </h1>

                {/* Add Product Button */}
                <button
                  onClick={() => navigate("/vendor/products/new")}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all transform active:scale-95"
                >
                  <Plus className="size-3.5" />
                  <span>+ Add Product</span>
                </button>
              </div>

              {/* Search & View Switcher */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Search Bar with Search Icon */}
                <div className="relative flex-1 sm:w-64">
                  <Input
                    type="text"
                    placeholder="Search orders, customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9 pl-3 h-9 bg-white border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 rounded-lg focus-visible:ring-indigo-500 shadow-xs"
                  />
                  <div className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <Search className="size-3.5" />
                  </div>
                </div>

                {/* View Switcher Bar (3 Views: List, Kanban, Calendar) */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg text-xs shadow-xs">
                  
                  <button
                    onClick={() => setViewMode("list")}
                    title="List View"
                    className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${
                      viewMode === "list"
                        ? "bg-indigo-600 text-white font-semibold shadow-xs"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <List className="size-4" />
                    <span className="text-xs font-semibold hidden sm:inline">List</span>
                  </button>
                  <button
                    onClick={() => setViewMode("kanban")}
                    title="Kanban View"
                    className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${
                      viewMode === "kanban"
                        ? "bg-indigo-600 text-white font-semibold shadow-xs"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <LayoutGrid className="size-4" />
                    <span className="text-xs font-semibold hidden sm:inline">Kanban</span>
                  </button>
                  <button
                    onClick={() => setViewMode("calendar")}
                    title="Calendar View"
                    className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${
                      viewMode === "calendar"
                        ? "bg-indigo-600 text-white font-semibold shadow-xs"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Calendar className="size-4" />
                    <span className="text-xs font-semibold hidden sm:inline">Calendar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Status Filter Badges + Summary Metrics Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              {/* Status Metric Filter Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    activeFilter === "all"
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === "today" ? "all" : "today")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    activeFilter === "today"
                      ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                      : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  <span className="flex size-4 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-[10px]">
                    {todayCount}
                  </span>
                  <span>Today</span>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === "pickup" ? "all" : "pickup")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    activeFilter === "pickup"
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <span className="flex size-4 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                    {pickupCount}
                  </span>
                  <span>To Pickup</span>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === "return" ? "all" : "return")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    activeFilter === "return"
                      ? "bg-sky-600 text-white border-sky-700 shadow-xs"
                      : "bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100"
                  }`}
                >
                  <span className="flex size-4 items-center justify-center rounded-full bg-sky-600 text-white font-bold text-[10px]">
                    {returnCount}
                  </span>
                  <span>To Return</span>
                </button>
                <button
                  onClick={() => setActiveFilter(activeFilter === "late" ? "all" : "late")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    activeFilter === "late"
                      ? "bg-rose-600 text-white border-rose-700 shadow-xs"
                      : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                  }`}
                >
                  <span className="flex size-4 items-center justify-center rounded-full bg-rose-600 text-white font-bold text-[10px]">
                    {lateCount}
                  </span>
                  <span>Late</span>
                </button>
              </div>

              {/* Right Metrics Summary */}
              <div className="flex items-center gap-4 text-xs font-medium flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
                  <Calendar className="size-3.5 text-slate-500" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="bg-transparent text-slate-800 font-medium outline-none cursor-pointer"
                  >
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="This Month">This Month</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200 font-mono text-slate-700 shadow-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">Sales</span>
                    <span className="font-bold text-emerald-700">${sales}</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">Late Fees</span>
                    <span className="font-bold text-rose-700">${lateFees}</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">Deposit</span>
                    <span className="font-bold text-amber-700">${deposit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VIEW MODE 1: LIST VIEW TABLE */}
            {viewMode === "list" ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-700 font-semibold uppercase tracking-wider">
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedOrders.length > 0 &&
                              selectedOrders.length === filteredOrders.length
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="size-3.5 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                          />
                        </th>
                        <th className="p-3">Order Reference</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Pickup Date</th>
                        <th className="p-3">Return Date</th>
                        <th className="p-3">Total</th>
                        <th className="p-3 text-right">Invoice Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                            No orders match the current filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const isSelected = selectedOrders.includes(order.id)
                          return (
                            <tr
                              key={order.id}
                              className={`hover:bg-slate-50/80 transition-colors ${
                                isSelected ? "bg-indigo-50/50" : ""
                              }`}
                            >
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleSelectOne(order.id, e.target.checked)}
                                  className="size-3.5 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                                />
                              </td>
                              <td className="p-3 font-bold text-indigo-600">{order.reference}</td>
                              <td className="p-3 font-sans font-medium text-slate-900">
                                {order.customer}
                                <span className="block text-[10px] text-slate-500">{order.item}</span>
                              </td>
                              <td className="p-3 font-sans">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                                    order.status
                                  )}`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600 text-[11px]">{order.pickupDate}</td>
                              <td className="p-3 text-slate-600 text-[11px]">{order.returnDate}</td>
                              <td className="p-3 font-bold text-slate-900">${order.total}</td>
                              <td className="p-3 text-right font-sans">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] ${getInvoiceStatusBadge(
                                    order.invoiceStatus
                                  )}`}
                                >
                                  {order.invoiceStatus}
                                </span>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="flex items-center justify-between p-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-600">
                  <div>
                    Showing <span className="font-semibold text-slate-900">{filteredOrders.length}</span> orders
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled
                      className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-400 opacity-50 cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-xs">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : viewMode === "kanban" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.length === 0 ? (
                  <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                    No orders found for Kanban view.
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 hover:border-indigo-300 hover:shadow-md transition-all shadow-xs group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                            {order.customer}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Package className="size-3 text-slate-400" />
                            <span>{order.item}</span>
                          </p>
                        </div>
                        <span className="font-mono font-extrabold text-indigo-600 text-sm">
                          ${order.total}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          {order.reference}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3 text-slate-400" />
                          <span>Pickup:</span>
                        </div>
                        <span className="font-mono text-slate-700">{order.pickupDate}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <VendorCalendar />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function VendorReportsView({
  orders,
  sales,
  storeTarget,
  onTargetUpdate,
}: {
  orders: any[]
  sales: number
  storeTarget: number
  onTargetUpdate: (newVal: number) => Promise<void>
}) {
  const [barTimeframe, setBarTimeframe] = useState<"weekly" | "monthly" | "yearly">("weekly")
  const [pieTimeframe, setPieTimeframe] = useState<"weekly" | "monthly" | "yearly">("weekly")

  const [isEditingTarget, setIsEditingTarget] = useState(false)
  const [targetInput, setTargetInput] = useState(String(storeTarget))

  useEffect(() => {
    setTargetInput(String(storeTarget))
  }, [storeTarget])

  const handleSaveTarget = async () => {
    const val = parseFloat(targetInput)
    if (isNaN(val) || val < 0) {
      alert("Please enter a valid target amount")
      return
    }
    await onTargetUpdate(val)
    setIsEditingTarget(false)
  }

  const totalOrders = orders.length
  const avgOrderValue = totalOrders ? Math.round(sales / totalOrders) : 0
  const activeRentals = orders.filter((o) => o.status === "Reserved").length

  // Calculate most rented (always yearly/all-time for leaderboard)
  const productCountsAll: Record<string, { title: string; count: number; revenue: number }> = {}
  for (const o of orders) {
    if (o.status === "Cancelled") continue
    const titles = o.item.split(", ")
    for (const title of titles) {
      if (!productCountsAll[title]) {
        productCountsAll[title] = { title, count: 0, revenue: 0 }
      }
      productCountsAll[title].count += 1
      productCountsAll[title].revenue += Math.round(o.total / titles.length)
    }
  }
  const mostRented = Object.values(productCountsAll)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const targetRevenue = storeTarget || 10000
  const progressPercent = Math.min(100, Math.round((sales / targetRevenue) * 100))

  // BAR CHART DYNAMIC DATA (COUNT OF PRODUCTS ORDERED)
  const now = new Date()
  let barData: { label: string; value: number }[] = []

  if (barTimeframe === "weekly") {
    // 7 days (last 7 days from today)
    const dayBars = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      dayBars.push({
        dateStr: d.toDateString(),
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        value: 0,
      })
    }

    for (const o of orders) {
      if (o.status === "Cancelled") continue
      let oDate = new Date()
      try {
        oDate = new Date(o.startDateRaw.replace(" ", "T"))
      } catch (e) {}

      const match = dayBars.find((b) => new Date(b.dateStr).toDateString() === oDate.toDateString())
      if (match) {
        const prodCount = o.item.split(", ").length
        match.value += prodCount
      }
    }
    barData = dayBars
  } else if (barTimeframe === "monthly") {
    // 4 weeks of the last 30 days
    const weekBars = [
      { label: "Wk 1", minDays: 22, maxDays: 30, value: 0 },
      { label: "Wk 2", minDays: 15, maxDays: 21, value: 0 },
      { label: "Wk 3", minDays: 8, maxDays: 14, value: 0 },
      { label: "Wk 4", minDays: 0, maxDays: 7, value: 0 },
    ]

    for (const o of orders) {
      if (o.status === "Cancelled") continue
      let oDate = new Date()
      try {
        oDate = new Date(o.startDateRaw.replace(" ", "T"))
      } catch (e) {}

      const diffTime = now.getTime() - oDate.getTime()
      const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000))

      if (diffDays >= 0 && diffDays <= 30) {
        const match = weekBars.find((b) => diffDays >= b.minDays && diffDays <= b.maxDays)
        if (match) {
          const prodCount = o.item.split(", ").length
          match.value += prodCount
        }
      }
    }
    barData = weekBars
  } else {
    // 12 months of the current year
    const monthBars = [
      { label: "Jan", month: 0, value: 0 },
      { label: "Feb", month: 1, value: 0 },
      { label: "Mar", month: 2, value: 0 },
      { label: "Apr", month: 3, value: 0 },
      { label: "May", month: 4, value: 0 },
      { label: "Jun", month: 5, value: 0 },
      { label: "Jul", month: 6, value: 0 },
      { label: "Aug", month: 7, value: 0 },
      { label: "Sep", month: 8, value: 0 },
      { label: "Oct", month: 9, value: 0 },
      { label: "Nov", month: 10, value: 0 },
      { label: "Dec", month: 11, value: 0 },
    ]

    const currentYear = now.getFullYear()
    for (const o of orders) {
      if (o.status === "Cancelled") continue
      let oDate = new Date()
      try {
        oDate = new Date(o.startDateRaw.replace(" ", "T"))
      } catch (e) {}

      if (oDate.getFullYear() === currentYear) {
        const match = monthBars.find((b) => b.month === oDate.getMonth())
        if (match) {
          const prodCount = o.item.split(", ").length
          match.value += prodCount
        }
      }
    }
    barData = monthBars
  }

  // PIE CHART DYNAMIC DATA (PRODUCTS ORDERED COUNT BY TIMEFRAME)
  const pieProductCounts: Record<string, number> = {}
  let totalPieCount = 0
  for (const o of orders) {
    if (o.status === "Cancelled") continue
    let oDate = new Date()
    try {
      oDate = new Date(o.startDateRaw.replace(" ", "T"))
    } catch (e) {}

    const diffTime = now.getTime() - oDate.getTime()
    const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000))

    let isWithin = false
    if (pieTimeframe === "weekly") {
      isWithin = diffDays >= 0 && diffDays <= 7
    } else if (pieTimeframe === "monthly") {
      isWithin = diffDays >= 0 && diffDays <= 30
    } else {
      isWithin = oDate.getFullYear() === now.getFullYear()
    }

    if (isWithin) {
      const titles = o.item.split(", ")
      for (const title of titles) {
        pieProductCounts[title] = (pieProductCounts[title] || 0) + 1
        totalPieCount += 1
      }
    }
  }

  const pieSlicesRaw = Object.entries(pieProductCounts)
    .map(([product, value]) => ({ product, value }))
    .sort((a, b) => b.value - a.value)

  // Group top 4 + Other
  let pieSlices = []
  if (pieSlicesRaw.length > 4) {
    pieSlices = pieSlicesRaw.slice(0, 4)
    const otherCount = pieSlicesRaw.slice(4).reduce((sum, slice) => sum + slice.value, 0)
    pieSlices.push({ product: "Other Products", value: otherCount })
  } else {
    pieSlices = pieSlicesRaw
  }

  let accumulatedPiePercent = 0
  const pieColors = [
    "#6366f1", // Indigo
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#06b6d4", // Cyan
    "#ec4899", // Pink
  ]

  const pieSlicesWithAngles = pieSlices.map((slice, idx) => {
    const percent = totalPieCount ? Math.round((slice.value / totalPieCount) * 100) : 0
    const start = accumulatedPiePercent
    accumulatedPiePercent += percent
    return {
      ...slice,
      percent,
      color: pieColors[idx % pieColors.length],
      start,
      end: accumulatedPiePercent,
    }
  })

  const pieConicGradientStyle = pieSlicesWithAngles.length > 0
    ? `conic-gradient(${pieSlicesWithAngles.map(s => `${s.color} ${s.start}% ${s.end}%`).join(", ")})`
    : `conic-gradient(#cbd5e1 0% 100%)`

  const handlePrintPDF = () => {
    const originalTitle = document.title
    document.title = `RMS_Vendor_Performance_Report_${new Date().toISOString().slice(0, 10)}`
    window.print()
    setTimeout(() => {
      document.title = originalTitle
    }, 100)
  }

  const handleExportCSV = () => {
    const headers = ["Order Date", "Reference", "Customer", "Items", "Total Amount ($)", "Status", "Invoice Status"]
    const rows = orders.map((o) => [
      o.startDateRaw || "",
      o.reference || "",
      o.customer || "",
      `"${(o.item || "").replace(/"/g, '""')}"`,
      o.total || 0,
      o.status || "",
      o.invoiceStatus || "",
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `vendor_sales_report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div id="print-reports-container" className="space-y-6 animate-in fade-in duration-300">
      <style>{`
        .print-only {
          display: none !important;
        }
        @media print {
          /* Hide non-printable layout elements completely */
          header, aside, footer, nav, .no-print, button, select, .profile-dropdown {
            display: none !important;
            visibility: hidden !important;
          }
          /* Reset page container constraints for body, html and wrapper divs */
          html, body, #root, #root > div, main {
            background-color: #ffffff !important;
            color: #000000 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Ensure report container is full-width and visible */
          #print-reports-container {
            visibility: visible !important;
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
          }
          #print-reports-container * {
            visibility: visible !important;
          }
          /* Show print-only elements in print preview */
          .print-only {
            display: block !important;
            visibility: visible !important;
          }
          /* Ensure stats grid prints nicely in grid layouts */
          #print-reports-container .grid {
            display: grid !important;
            gap: 15px !important;
          }
          /* Ensure charts and cards don't break across pages */
          .rounded-2xl, .rounded-xl {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* PDF Only Print Header */}
      <div className="print-only border-b-2 border-indigo-600 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">RMS PERFORMANCE REPORT</h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">Vendor Analytics & Sales Audit Report</p>
          </div>
          <div className="text-right text-[11px] text-slate-500 font-mono">
            <p className="font-bold text-slate-800">EasyRental Vendor Hub</p>
            <p>Generated: {new Date().toLocaleString()}</p>
            <p>Status: Authenticated</p>
          </div>
        </div>

        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-600 leading-relaxed">
          <p className="font-bold text-slate-800 uppercase tracking-wide text-[9px] mb-1">Executive Summary</p>
          This document represents the official sales performance and product distribution audit report for the vendor. All metrics listed herein—including Total Sales, Orders Received, Average Order Value, and Active Rentals—are aggregated directly from verified customer bookings. Timeframe-based analytics for product distribution and order trends are detailed below.
        </div>
      </div>

      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Rental Performance Report</h2>
          <p className="text-xs text-slate-500">Generate, print, or download sales performance statistics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-xs"
          >
            <Printer className="size-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md group">
          <div className="absolute right-0 top-0 size-24 rounded-bl-full bg-emerald-500/5 transition-all group-hover:scale-110" />
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <DollarSign className="size-5" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Sales</p>
            <h4 className="mt-1 text-2xl font-extrabold text-slate-900">${sales}</h4>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md group">
          <div className="absolute right-0 top-0 size-24 rounded-bl-full bg-indigo-500/5 transition-all group-hover:scale-110" />
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <ShoppingBag className="size-5" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Orders Received</p>
            <h4 className="mt-1 text-2xl font-extrabold text-slate-900">{totalOrders}</h4>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md group">
          <div className="absolute right-0 top-0 size-24 rounded-bl-full bg-amber-500/5 transition-all group-hover:scale-110" />
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <TrendingUp className="size-5" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Average Order Value</p>
            <h4 className="mt-1 text-2xl font-extrabold text-slate-900">${avgOrderValue}</h4>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md group">
          <div className="absolute right-0 top-0 size-24 rounded-bl-full bg-sky-500/5 transition-all group-hover:scale-110" />
          <div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <Calendar className="size-5" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Rentals</p>
            <h4 className="mt-1 text-2xl font-extrabold text-slate-900">{activeRentals}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sales Performance Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Products Ordered Trend</h3>
              <p className="text-xs text-slate-500">Breakdown of total items ordered over selected timeframe</p>
              <p className="print-only text-[11px] text-slate-500 mt-2 font-medium leading-relaxed">
                <strong>Fig 1. Chronological Order Trend analysis:</strong> Shows checkout distribution frequency. This visual metric traces demand flow day-by-day, week-by-week, or month-by-month depending on the active performance filter.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={barTimeframe}
                onChange={(e) => setBarTimeframe(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
                <Award className="size-3.5 shrink-0" /> Target {progressPercent}% Met
              </span>
            </div>
          </div>

          {/* Premium Gradient Bar Chart */}
          <div className="h-60 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 font-mono text-xs">
            {barData.map((bar, idx) => {
              const maxVal = Math.max(...barData.map((b) => b.value), 5)
              const barHeight = Math.max(8, Math.min(100, Math.round((bar.value / maxVal) * 100)))

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group animate-in fade-in duration-200">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow-md font-bold mb-1 -translate-y-1">
                    {bar.value} item{bar.value === 1 ? "" : "s"}
                  </div>
                  <div className="w-full relative rounded-t-lg overflow-hidden bg-slate-50 border border-slate-200/50 flex flex-col justify-end h-40">
                    <div
                      style={{ height: `${barHeight}%` }}
                      className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-indigo-600 transition-all duration-500 group-hover:from-indigo-600 group-hover:to-indigo-700"
                    />
                  </div>
                  <span className="text-slate-500 text-[10px] font-semibold mt-1 font-sans">{bar.label}</span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 font-sans font-medium">
            <span>Product inventory metrics active</span>
            <span>Total units ordered</span>
          </div>
        </div>

        {/* Pie/Donut Chart Card */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Products Share</h3>
              <p className="text-xs text-slate-500">Distribution of items ordered</p>
              <p className="print-only text-[11px] text-slate-500 mt-2 font-medium leading-relaxed">
                <strong>Fig 2. Product share distribution:</strong> Illustrates the percentage contribution of individual equipment items to total order volume, helping optimize stock allocation.
              </p>
            </div>
            <select
              value={pieTimeframe}
              onChange={(e) => setPieTimeframe(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="flex flex-col items-center justify-center py-2 relative">
            <div
              style={{ background: pieConicGradientStyle }}
              className="rounded-full size-36 relative shadow-md transition-all hover:scale-105 flex items-center justify-center animate-in zoom-in duration-300"
            >
              <div className="absolute inset-5 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Items</span>
                <span className="text-sm font-extrabold text-slate-900">{totalPieCount}</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-2 max-h-36 overflow-y-auto">
            {pieSlicesWithAngles.length === 0 ? (
              <p className="text-[10px] text-slate-500 text-center">No products ordered in this timeframe</p>
            ) : (
              pieSlicesWithAngles.map((slice, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] font-sans">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-slate-600 font-medium truncate" title={slice.product}>
                      {slice.product}
                    </span>
                  </div>
                  <span className="font-mono text-slate-900 font-bold shrink-0">
                    {slice.value}x ({slice.percent}%)
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Most Rented list + Monthly target progress card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Most Rented list */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col border-b border-slate-100 pb-2">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Award className="size-4 text-amber-500" />
              <span>Most Rented Items Leaderboard</span>
            </h4>
            <p className="print-only text-[11px] text-slate-500 mt-2 font-medium leading-relaxed">
              <strong>Table 1. High Velocity Rental Leaderboard:</strong> Tabulates the top 5 most frequently reserved equipment listings sorted by checkout frequency and accumulated gross rental sales.
            </p>
          </div>

          {mostRented.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No sales records available.</p>
          ) : (
            <div className="space-y-3.5">
              {mostRented.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate">{prod.title}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{prod.count} reservation{prod.count === 1 ? "" : "s"}</p>
                  </div>
                  <span className="font-mono font-extrabold text-indigo-600 shrink-0">
                    ${prod.revenue}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly target progress card */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Monthly Store Target</h4>
              <p className="text-xs text-slate-500 mt-1">Goal tracking toward local target margins</p>
            </div>
            {isEditingTarget ? (
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  className="w-16 rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-xs text-right font-bold text-slate-800 outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveTarget}
                  className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                  title="Save Target"
                >
                  <Check className="size-3" />
                </button>
                <button
                  onClick={() => setIsEditingTarget(false)}
                  className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                  title="Cancel"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setTargetInput(String(storeTarget))
                  setIsEditingTarget(true)
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors shrink-0"
                title="Edit target value"
              >
                <Edit2 className="size-3" />
                <span>Edit</span>
              </button>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Revenue Target</span>
              <span>${sales} / ${targetRevenue}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-indigo-600 rounded-full transition-all duration-700"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic mt-2">
            *Calculated based on active and completed rental totals for the month.
          </p>
        </div>
      </div>
    </div>
  )
}

export default VendorDashboard
