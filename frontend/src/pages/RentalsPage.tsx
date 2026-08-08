import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * RentalsPage — Phase 1 placeholder.
 * Shows all rentals in table form — full build in Phase 3/4.
 */
export default function RentalsPage() {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-body-md mb-1 font-medium text-foreground">
          No rentals yet
        </p>
        <p className="mb-4 text-sm text-muted-foreground">
          Create your first rental to see it here.
        </p>
        <Button
          size="sm"
          className="gap-1.5 rounded-full px-4"
          onClick={() => navigate("/rentals/new")}
        >
          <Plus className="h-4 w-4" />
          New Rental
        </Button>
      </div>
    </div>
  );
}
