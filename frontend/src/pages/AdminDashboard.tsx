import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import {
  Building2,
  Search,
  List,
  LayoutGrid,
  ChevronDown,
  User,
  LogOut,
  Settings as SettingsIcon,
  Plus,
  Calendar,
  Package,
  Clock,
} from "lucide-react"

// Types
type ViewMode = "list" | "kanban"
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
    pickupDate: "Jul 4, 1:00pm",
    returnDate: "Jul 7, 1:00pm",
    total: 50,
    invoiceStatus: "Invoiced",
  },
]

export function AdminDashboard() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [activeNavTab, setActiveNavTab] = useState<"orders" | "schedule" | "products" | "reports" | "settings">("orders")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [dateRange, setDateRange] = useState("Last 7 Days")

  // Filtered Orders
  const filteredOrders = INITIAL_ORDERS.filter((order) => {
    const matchesSearch =
      order.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.item.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeFilter === "today") return order.status === "Reserved" || order.status === "Picked Up"
    if (activeFilter === "pickup") return order.status === "Picked Up" || order.status === "Late pickup"
    if (activeFilter === "return") return order.status === "Late Return" || order.status === "Reserved"
    if (activeFilter === "late") return order.status === "Late pickup" || order.status === "Late Return"

    return true
  })

  // Select all handler
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(filteredOrders.map((o) => o.id))
    } else {
      setSelectedOrders([])
    }
  }

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
      {/* TOP HEADER NAVIGATION (LIGHT THEME) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6 shadow-xs">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
          {/* Left Brand + Navigation Links */}
          <div className="flex items-center gap-6">
            <Link to="/admin/dashboard" className="flex items-center gap-2 group">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
                <Building2 className="size-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">Your Logo</span>
            </Link>

            <nav className="flex items-center space-x-1 sm:space-x-2 text-xs font-medium">
              {[
                { id: "orders", label: "Orders" },
                { id: "schedule", label: "Schedule" },
                { id: "products", label: "Products" },
                { id: "reports", label: "Reports" },
                { id: "settings", label: "Settings" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveNavTab(tab.id as any)}
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
              className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <span className="font-semibold text-slate-900">Alex Admin</span>
              <div className="flex size-7 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs">
                A
              </div>
              <ChevronDown className="size-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown Popup */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-xl p-1.5 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-semibold text-slate-900">Alex Smith</p>
                  <p className="text-[10px] text-slate-500">admin@rentalsuite.com</p>
                </div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false)
                    alert("Admin Profile Settings Opened")
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <User className="size-3.5 text-indigo-600" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("admin_user")
                    navigate("/admin/signin")
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                >
                  <LogOut className="size-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN DASHBOARD CONTENT CONTAINER (LIGHT THEME) */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Title + Action Button + Search + View Switcher Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Rental Order</span>
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <SettingsIcon className="size-4" />
              </button>
            </h1>

            {/* New Button (Purple pill) */}
            <button
              onClick={() => alert("New Rental Order Modal Triggered")}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition-all transform active:scale-95"
            >
              <Plus className="size-3.5" />
              <span>New</span>
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

            {/* View Switcher Bar */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg text-xs shadow-xs">
              <span className="text-[10px] text-slate-500 font-medium px-2 hidden md:inline">View Switcher</span>
              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <List className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                title="Kanban View"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "kanban"
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LayoutGrid className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Badges + Summary Metrics Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          {/* Status Metric Filter Badges (Wireframe matching: 2 Today, 3 Pickup, 3 Return, 1 Late) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                activeFilter === "all"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
              }`}
            >
              All ({INITIAL_ORDERS.length})
            </button>

            <button
              onClick={() => setActiveFilter(activeFilter === "today" ? "all" : "today")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                activeFilter === "today"
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                  : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <span className="flex size-4 items-center justify-center rounded-full bg-amber-600 text-white font-bold text-[10px]">
                2
              </span>
              <span>Today</span>
            </button>

            <button
              onClick={() => setActiveFilter(activeFilter === "pickup" ? "all" : "pickup")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                activeFilter === "pickup"
                  ? "bg-purple-600 text-white border-purple-700 shadow-xs"
                  : "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
              }`}
            >
              <span className="flex size-4 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-[10px]">
                3
              </span>
              <span>Pickup</span>
            </button>

            <button
              onClick={() => setActiveFilter(activeFilter === "return" ? "all" : "return")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                activeFilter === "return"
                  ? "bg-purple-600 text-white border-purple-700 shadow-xs"
                  : "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
              }`}
            >
              <span className="flex size-4 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-[10px]">
                3
              </span>
              <span>Return</span>
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
                1
              </span>
              <span>Late</span>
            </button>
          </div>

          {/* Right Metrics Summary (Date Range + Sales / Late Fees / Deposit) */}
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
                <span className="font-bold text-emerald-700">$1945</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">Late Fees</span>
                <span className="font-bold text-rose-700">$235</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">Deposit</span>
                <span className="font-bold text-amber-700">$710</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW MODE 1: LIST VIEW TABLE (LIGHT THEME) */}
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
        ) : (
          /* ========================================================================= */
          /* VIEW MODE 2: KANBAN VIEW GRID (LIGHT THEME) */
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
                      <Clock className="size-3 text-slate-400" />
                      <span>Rental Duration</span>
                    </div>
                    <span className="font-mono text-slate-600 text-[10px]">
                      {order.pickupDate.split(",")[0]} - {order.returnDate.split(",")[0]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
