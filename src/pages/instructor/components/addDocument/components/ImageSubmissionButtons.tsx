import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ImageSubmissionButtonsProps {
  selectedCount: number;
  totalCount: number;
  isSubmitting: boolean;
  onSubmitAll: () => void;
  onSubmitSelected: () => void;
}

export default function ImageSubmissionButtons({
  selectedCount,
  totalCount,
  isSubmitting,
  onSubmitAll,
  onSubmitSelected,
}: ImageSubmissionButtonsProps) {
  return (
    <div className="p-6 bg-background border-t space-y-3">
      <Button
        onClick={onSubmitAll}
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary/90"
        size="sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          `Submit All Images (${totalCount})`
        )}
      </Button>

      <Button
        onClick={onSubmitSelected}
        disabled={selectedCount === 0 || isSubmitting}
        variant="outline"
        className="w-full"
        size="sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          `Submit Selected Images (${selectedCount})`
        )}
      </Button>
    </div>
  );
}
