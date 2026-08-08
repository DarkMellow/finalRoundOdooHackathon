import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ProductsPage — Phase 1 placeholder.
 * Full product table + modals built in Phase 2.
 */
export default function ProductsPage() {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-body-md mb-1 font-medium text-foreground">
          No products added yet
        </p>
        <p className="mb-4 text-sm text-muted-foreground">
          Add your first rental product to get started.
        </p>
        <Button size="sm" className="gap-1.5 rounded-full px-4">
          <Plus className="h-4 w-4" />
          New Product
        </Button>
      </div>
    </div>
  );
}
