import type { ReactNode } from "react"

interface InfoSectionProps {
  title: string
  onEdit?: () => void
  children: ReactNode
}

export function InfoSection({ title, onEdit, children }: InfoSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
          >
            Edit
          </button>
        )}
      </div>
      {children}
    </section>
  )
}
