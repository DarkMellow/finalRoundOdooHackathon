import { useState, useEffect, useMemo } from "react"
import {
  X,
  Package,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Search,
  CheckCircle2,
  Loader2,
  FileText,
  Ban,
} from "lucide-react"
import {
  fetchCustomerOrders,
  cancelCustomerOrder,
  type CustomerOrder,
  type OrderStatus,
} from "@/lib/customerOrdersApi"
import { Button } from "@/components/ui/button"

interface CustomerOrdersViewProps {
  isOpen: boolean
  onClose: () => void
  onSelectProduct?: (productId: string) => void
}

export function CustomerOrdersView({
  isOpen,
  onClose,
  onSelectProduct,
}: CustomerOrdersViewProps) {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed" | "cancelled">("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Load orders using the API mimicking function
  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    setToastMessage(null)

    fetchCustomerOrders(activeFilter)
      .then((data) => {
        setOrders(data)
      })
      .catch((err) => {
        console.error("Failed to load customer orders:", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isOpen, activeFilter])

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Handle Order Cancellation
  const handleCancelOrder = async (orderId: string, reference: string) => {
    if (!confirm(`Are you sure you want to cancel reservation ${reference}?`)) return

    setActionLoadingId(orderId)
    try {
      const res = await cancelCustomerOrder(orderId)
      setOrders(res.orders)
      setToastMessage(`Reservation ${reference} cancelled successfully.`)
      setTimeout(() => setToastMessage(null), 3500)
    } catch (err) {
      console.error("Cancellation failed:", err)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Handle Invoice Download
  const handleDownloadInvoice = (reference: string) => {
    setToastMessage(`Downloading official invoice for ${reference}...`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Filtered orders list by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders
    const query = searchQuery.toLowerCase()
    return orders.filter((order) => {
      const matchesRef = order.reference.toLowerCase().includes(query)
      const matchesItem = order.items.some(
        (i) => i.title.toLowerCase().includes(query) || i.brand.toLowerCase().includes(query)
      )
      return matchesRef || matchesItem
    })
  }, [orders, searchQuery])

  if (!isOpen) return null

  // Calculate Remaining Time helper for Active Rentals
  const calculateRemainingTime = (endDateStr: string) => {
    const end = new Date(endDateStr).getTime()
    const now = new Date().getTime()
    const diffMs = end - now
    if (diffMs <= 0) return "Expired"

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60))
    const days = Math.floor(totalHours / 24)
    const hours = totalHours % 24

    if (days > 0) {
      return `${days}d ${hours}h remaining`
    }
    return `${hours}h remaining`
  }

  // Status Badge Helper
  const renderStatusBadge = (status: OrderStatus, endDate?: string) => {
    switch (status) {
      case "Active":
        const remainingText = endDate ? calculateRemainingTime(endDate) : null
        return (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Rental
            </span>
            {remainingText && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow-xs">
                <Clock className="size-3 text-emerald-100" />
                <span>{remainingText}</span>
              </span>
            )}
          </div>
        )
      case "Pending Pickup":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Clock className="size-3 text-blue-600" />
            Pending Pickup
          </span>
        )
      case "Completed":
      case "Returned":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            <CheckCircle2 className="size-3 text-slate-600" />
            Completed & Returned
          </span>
        )
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            <Ban className="size-3 text-rose-600" />
            Cancelled
          </span>
        )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/50 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      {/* Modal Container (Discord Settings / Notion Design System inspired) */}
      <div
        className="relative flex flex-col w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                <span>My Rental Orders</span>
                <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {orders.length} Total
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Track active equipment rentals, return deadlines, and past order receipts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-slate-200/60 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Close (Esc)"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 px-6 py-3 bg-white gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: "all", label: "All Orders" },
                { id: "active", label: "Active Rentals" },
                { id: "completed", label: "Completed" },
                { id: "cancelled", label: "Cancelled" },
              ] as const
            ).map((tab) => {
              const isActive = activeFilter === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Notification Toast */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="size-4 text-blue-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading your rental orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center p-6 text-slate-500">
              <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                <Package className="size-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Orders Found</h3>
              <p className="text-xs max-w-xs text-slate-500">
                {searchQuery
                  ? `No orders matching "${searchQuery}".`
                  : "You haven't placed any rental orders under this filter yet."}
              </p>
              <Button onClick={onClose} className="rounded-full mt-2 font-bold">
                Browse Rental Catalog
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const formattedOrderDate = new Date(order.orderDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
                const isCancelling = actionLoadingId === order.id

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all space-y-4 p-5"
                  >
                    {/* Order Top Summary Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-extrabold text-slate-900">
                            {order.reference}
                          </span>
                          {renderStatusBadge(order.status, order.endDate)}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Placed on <span className="font-semibold text-slate-700">{formattedOrderDate}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleDownloadInvoice(order.reference)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
                        >
                          <FileText className="size-3.5 text-slate-600" />
                          <span>Receipt</span>
                        </button>

                        {(order.status === "Active" || order.status === "Pending Pickup") && (
                          <button
                            onClick={() => handleCancelOrder(order.id, order.reference)}
                            disabled={isCancelling}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            {isCancelling ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Ban className="size-3.5" />
                            )}
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Rental Timeframe Card */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs gap-3">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Calendar className="size-4 text-primary shrink-0" />
                        <div>
                          <span className="font-semibold">Rental Timeframe: </span>
                          <span className="font-mono font-bold text-slate-900">
                            {order.startDate.replace("T", " ")}
                          </span>{" "}
                          to{" "}
                          <span className="font-mono font-bold text-slate-900">
                            {order.endDate.replace("T", " ")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 bg-slate-200/70 px-2.5 py-1 rounded-full">
                          <Clock className="size-3 text-slate-500" />
                          <span>{order.totalHours}h Total</span>
                        </div>
                        {order.status === "Active" && (
                          <div className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
                            <span className="size-1.5 rounded-full bg-emerald-600 animate-ping" />
                            <span>{calculateRemainingTime(order.endDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rented Items List */}
                    <div className="space-y-3">
                      {order.items.map((item) => {
                        const itemTotal = (
                          item.hourlyRate *
                          order.totalHours *
                          item.quantity
                        ).toFixed(2)
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/40 gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                onClick={() => onSelectProduct && onSelectProduct(item.productId)}
                                className="size-16 shrink-0 overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white cursor-pointer group"
                              >
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              <div className="min-w-0 flex-1 space-y-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  {item.brand}
                                </span>
                                <h4
                                  onClick={() => onSelectProduct && onSelectProduct(item.productId)}
                                  className="text-xs sm:text-sm font-bold text-slate-900 truncate hover:text-primary cursor-pointer transition-colors"
                                >
                                  {item.title}
                                </h4>
                                {item.variantName && (
                                  <p className="text-[11px] text-slate-500 font-medium truncate">
                                    {item.variantName}
                                  </p>
                                )}

                                <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                                  <span className="font-bold text-primary">${item.hourlyRate}/hr</span>
                                  <span>×</span>
                                  <span>{order.totalHours} hrs</span>
                                  <span>×</span>
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-mono text-sm font-extrabold text-slate-900">
                                ${itemTotal}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Order Bottom Footer: Address, Payment, Total */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{order.deliveryAddress}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="size-3.5 text-slate-400 shrink-0" />
                          <span>{order.paymentMethod}</span>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2 self-end sm:self-center">
                        <span className="text-xs font-semibold text-slate-500">Order Total:</span>
                        <span className="font-mono text-lg font-black text-primary">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
