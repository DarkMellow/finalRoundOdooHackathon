import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * DashboardPage — Phase 1 placeholder.
 * Full stat cards + filterable table will be built in Phase 4.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Stat Cards Placeholder */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Active Rentals", "Due Today", "Overdue", "Deposits Held"].map(
          (label) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card p-6 shadow-notion-soft transition-shadow hover:shadow-notion-elevated"
            >
              <p className="text-eyebrow mb-1 uppercase text-muted-foreground">
                {label}
              </p>
              <p className="text-heading-1 text-3xl font-bold tracking-tight text-foreground">
                —
              </p>
            </div>
          ),
        )}
      </div>

      {/* Table Placeholder */}
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-body-md mb-1 font-medium text-foreground">
            No rentals yet
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first rental to see it here.
          </p>
          <Button size="sm" className="gap-1.5 rounded-full px-4">
            <Plus className="h-4 w-4" />
            New Rental
          </Button>
        </div>
      </div>
    </div>
  );
}
