import { useState, useEffect } from "react"
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronDown,
  Package,
} from "lucide-react"
import {
  fetchMonthlyCalendarEvents,
  fetchDateScheduleReport,
  type MonthDaySummary,
  type DailyScheduleItem,
} from "@/lib/vendorCalendarApi"
import { DateScheduleModal } from "./DateScheduleModal"
import { Button } from "@/components/ui/button"

export function VendorCalendar() {
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-01")
  const [summaries, setSummaries] = useState<Record<string, MonthDaySummary>>({})
  const [selectedDate, setSelectedDate] = useState<string>("2026-01-28")
  const [dateItems, setDateItems] = useState<DailyScheduleItem[]>([])
  const [loadingItems, setLoadingItems] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Load monthly calendar summaries
  useEffect(() => {
    fetchMonthlyCalendarEvents(2026, 1).then((data) => {
      setSummaries(data)
    })
  }, [selectedMonth])

  // Load schedule details when selected date changes
  useEffect(() => {
    if (!selectedDate) return
    setLoadingItems(true)
    fetchDateScheduleReport(selectedDate)
      .then(setDateItems)
      .finally(() => setLoadingItems(false))
  }, [selectedDate])

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    setIsModalOpen(true)
  }

  // Days of week header
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"]

  // Jan 2026 starts on Thursday (day index 4)
  const startingOffset = 4
  const daysInMonth = 31

  const renderDotColor = (color: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-500"
      case "purple":
        return "bg-purple-500"
      case "amber":
        return "bg-amber-500"
      case "rose":
        return "bg-rose-500"
      default:
        return "bg-sky-500"
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Controls (Matching Wireframe Header) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button size="sm" className="rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs">
            <Plus className="size-4 mr-1" /> New
          </Button>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Rental Scheduler</span>
          </h2>
        </div>

        {/* Month Selector Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2 pr-9 text-sm font-extrabold text-slate-900 shadow-xs outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="2026-01">Jan 2026</option>
              <option value="2026-02">Feb 2026</option>
              <option value="2026-03">Mar 2026</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-2.5 size-4 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Calendar Content Pane (Grid & Details matching Wireframe) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANE: CALENDAR GRID (lg:col-span-6) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center font-bold text-sm text-slate-700 border-b border-slate-200 pb-3">
            {weekDays.map((day, idx) => (
              <div key={idx}>{day}</div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading offset cells */}
            {Array.from({ length: startingOffset }).map((_, idx) => (
              <div key={`offset-${idx}`} className="h-16 rounded-xl bg-slate-50/50" />
            ))}

            {/* Days 1 to 31 */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1
              const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
              const dateStr = `2026-01-${pad(dayNum)}`
              const summary = summaries[dateStr]
              const isSelected = selectedDate === dateStr

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(dateStr)}
                  className={`relative flex flex-col items-center justify-between h-16 p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-2 border-slate-900 bg-slate-100 shadow-sm scale-105"
                      : "border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30"
                  }`}
                >
                  <span className="text-sm font-bold text-slate-900">{dayNum}</span>

                  {/* Colored indicator dots for daily scheduled rentals */}
                  {summary && summary.dots.length > 0 ? (
                    <div className="flex items-center gap-1 overflow-hidden px-1">
                      {summary.dots.slice(0, 4).map((dot, dIdx) => (
                        <span
                          key={dIdx}
                          className={`size-2 rounded-full ${renderDotColor(dot.color)}`}
                          title={dot.label}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-2" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* RIGHT PANE: SELECTED DATE SCHEDULE DETAILS (lg:col-span-6 matching Wireframe layout) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="size-4 text-indigo-600" />
              <span>Schedule Details ({selectedDate})</span>
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold rounded-lg"
            >
              Open Full Modal
            </Button>
          </div>

          {loadingItems ? (
            <p className="text-xs font-semibold text-slate-500 py-6 text-center">
              Loading daily schedule...
            </p>
          ) : dateItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 space-y-2">
              <Package className="size-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">No Orders Scheduled for {selectedDate}</p>
              <p className="text-[11px] text-slate-400">Click any date cell with indicator dots on the calendar grid.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Itemized Order List matching Wireframe format */}
              <div className="space-y-2.5">
                {dateItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 transition-colors text-xs gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="font-mono font-bold text-slate-700">{idx + 1}.</span>
                      <span className="font-mono font-extrabold text-indigo-600 shrink-0">
                        {item.orderRef}:
                      </span>
                      <span className="font-bold text-slate-900 truncate">
                        {item.productTitle}, {item.customerName}, {item.units} Unit{item.units === 1 ? "" : "s"}
                      </span>
                    </div>

                    <span
                      className={`shrink-0 px-2.5 py-0.5 rounded-full font-extrabold text-[11px] border ${
                        item.status === "Available"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : item.status === "Booked"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : item.status === "Picked Up"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      ({item.status})
                    </span>
                  </div>
                ))}
              </div>

              {/* Wireframe Footnote */}
              <p className="text-[11px] text-slate-500 italic text-center pt-2">
                *(all the status mentioned in the brackets are showing the product availability)*
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Date Schedule Modal */}
      <DateScheduleModal
        dateStr={selectedDate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
