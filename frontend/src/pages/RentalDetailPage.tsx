import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * RentalDetailPage — Phase 1 placeholder.
 * Full detail view + return modal built in Phase 3.
 */
export default function RentalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Summary Card Placeholder */}
      <div className="rounded-xl border border-border bg-card p-8">
        <p className="text-body-md text-center text-muted-foreground">
          Rental #{id} detail view will be built here in Phase 3.
        </p>
      </div>
    </div>
  );
}
