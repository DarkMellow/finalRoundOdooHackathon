import { useState, useEffect } from "react"
import { X, Calendar, Clock, CheckCircle2, AlertCircle, Loader2, Package, Tag } from "lucide-react"
import {
  fetchDateScheduleReport,
  type DailyScheduleItem,
  type ScheduleStatus,
} from "@/lib/vendorCalendarApi"
import { Button } from "@/components/ui/button"

interface DateScheduleModalProps {
  dateStr: string | null
  isOpen: boolean
  onClose: () => void
}

export function DateScheduleModal({
  dateStr,
  isOpen,
  onClose,
}: DateScheduleModalProps) {
  const [items, setItems] = useState<DailyScheduleItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!isOpen || !dateStr) return

    setLoading(true)
    fetchDateScheduleReport(dateStr)
      .then((data) => {
        setItems(data)
      })
      .catch((err) => {
        console.error("Failed to load date schedule report:", err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [dateStr, isOpen])

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

  if (!isOpen || !dateStr) return null

  // Format date display (e.g. Jan 28, 2026)
  const dateObj = new Date(dateStr)
  const formattedDate = isNaN(dateObj.getTime())
    ? dateStr
    : dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })

  const getStatusBadge = (status: ScheduleStatus) => {
    switch (status) {
      case "Available":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="size-3 text-emerald-600" />
            Available
          </span>
        )
      case "Booked":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 border border-purple-200">
            <Tag className="size-3 text-purple-600" />
            Booked
          </span>
        )
      case "Picked Up":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
            <Clock className="size-3 text-amber-600" />
            Picked Up
          </span>
        )
      case "Late Return":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
            <AlertCircle className="size-3 text-rose-600" />
            Late Return
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            In Repair
          </span>
        )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/50 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[88vh] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 font-bold">
              <Calendar className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                <span>Daily Sales & Schedule Report</span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                  {formattedDate}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Equipment availability & active reservations breakdown
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

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="size-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium">Fetching schedule report for {formattedDate}...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-center p-6 text-slate-500">
              <Package className="size-10 text-slate-300" />
              <h4 className="text-base font-bold text-slate-900">No Reservations Scheduled</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                No product bookings or returns recorded for {formattedDate}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Itemized Order List matching Wireframe format */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Order & Equipment Overview</span>
                  <span>Availability Status</span>
                </div>

                <div className="space-y-2.5">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-indigo-600">
                              {item.orderRef}:
                            </span>
                            <span className="text-sm font-bold text-slate-900 truncate">
                              {item.productTitle}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            Customer: <span className="font-semibold text-slate-700">{item.customerName}</span> •{" "}
                            <span className="font-semibold text-slate-700">{item.units} Unit{item.units === 1 ? "" : "s"}</span>
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">{getStatusBadge(item.status)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wireframe Footnote Explanation */}
              <p className="text-[11px] text-slate-500 italic text-center pt-1">
                *(All status mentioned in brackets show product availability & reservation states)*
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 bg-slate-50">
          <span className="text-xs font-semibold text-slate-500">
            {items.length} Reservation Entry{items.length === 1 ? "" : "s"}
          </span>
          <Button onClick={onClose} size="sm" className="rounded-lg font-bold">
            Close Report
          </Button>
        </div>
      </div>
    </div>
  )
}
