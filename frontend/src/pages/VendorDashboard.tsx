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
const INITIAL_ORDERS: Order[] = [
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
              <Package className="size-3.5" />
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

        {/* ========================================================================= */}
        {/* VIEW MODE 1: LIST VIEW TABLE */}
        {/* ========================================================================= */}
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
          /* ========================================================================= */
          /* VIEW MODE 2: KANBAN VIEW GRID */
          /* ========================================================================= */
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
                  {/* Card Top: Customer Name & Item Price */}
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

                  {/* Card Middle: Reference & Status Pill */}
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

                  {/* Card Bottom: Rental Duration */}
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
          /* ========================================================================= */
          /* VIEW MODE 3: RENTAL SCHEDULER CALENDAR VIEW */
          /* ========================================================================= */
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <VendorCalendar />
          </div>
        )}
      </main>
    </div>
  )
}

export default VendorDashboard
