import type { ReactNode } from "react"

interface ActivitySectionProps {
  title: string
  children: ReactNode
  onLoadMore?: () => void
  showLoadMore?: boolean
  loadingMore?: boolean
  onViewAll?: () => void
  showViewAll?: boolean
  gridClassName?: string
}

export function ActivitySection({
  title,
  children,
  onLoadMore,
  showLoadMore = false,
  loadingMore = false,
  onViewAll,
  showViewAll = false,
  gridClassName = "grid grid-cols-1 sm:grid-cols-2 gap-4",
}: ActivitySectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {showViewAll && onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
          >
            View All
          </button>
        )}
      </div>

      <div className={gridClassName}>{children}</div>

      {showLoadMore && onLoadMore && (
        <div className="mt-4 flex justify-center border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </section>
  )
}
