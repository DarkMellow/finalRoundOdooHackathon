import { useEffect } from "react"
import { X } from "lucide-react"
import { ItemCard } from "@/components/profile/ItemCard"
import type { ProfileInvoice, ProfileRentalItem } from "@/lib/profileFetcher"

type ProfileItemsModalProps =
  | {
      isOpen: boolean
      onClose: () => void
      title: string
      variant: "rental"
      items: ProfileRentalItem[]
    }
  | {
      isOpen: boolean
      onClose: () => void
      title: string
      variant: "invoice"
      items: ProfileInvoice[]
    }

export function ProfileItemsModal(props: ProfileItemsModalProps) {
  const { isOpen, onClose, title, variant, items } = props

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {items.length} item{items.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
            title="Close (Esc)"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">No items to display.</p>
          ) : (
            <div className="space-y-3">
              {variant === "rental"
                ? items.map((item) => (
                    <ItemCard key={item.id} variant="rental" item={item as ProfileRentalItem} />
                  ))
                : items.map((item) => (
                    <ItemCard key={item.id} variant="invoice" item={item as ProfileInvoice} />
                  ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
