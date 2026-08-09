import { FileText, Package } from "lucide-react"
import type { ProfileInvoice, ProfileRentalItem } from "@/lib/profileFetcher"

type ItemCardProps =
  | { variant: "rental"; item: ProfileRentalItem }
  | { variant: "invoice"; item: ProfileInvoice }

export function ItemCard(props: ItemCardProps) {
  if (props.variant === "invoice") {
    const { item } = props
    return (
      <article className="flex min-h-[120px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-colors hover:border-slate-300">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{item.invoiceNumber}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {new Date(item.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-black text-slate-900">
            ₹{item.amount.toLocaleString("en-IN")}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              item.status === "paid"
                ? "bg-emerald-50 text-emerald-700"
                : item.status === "overdue"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {item.status}
          </span>
        </div>
      </article>
    )
  }

  const { item } = props
  return (
    <article className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition-colors hover:border-slate-300">
      {item.image ? (
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-100">
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-300">
          <Package className="size-6" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-800">{item.name}</p>
          {item.status && (
            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600">
              {item.status}
            </span>
          )}
        </div>
        {item.rentedFrom && item.rentedUntil && (
          <p className="mt-1.5 text-[10px] text-slate-500">
            {new Date(item.rentedFrom).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
            {" – "}
            {new Date(item.rentedUntil).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>
    </article>
  )
}
