import { Button } from "@/components/ui/button";
import type { PaginationProps } from "../types";

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  documentsCount,
  setCurrentPage,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages || totalItems === 0;

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-xs text-muted-foreground">
        Showing {documentsCount} of {totalItems} documents
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={isFirstPage}
          className="text-xs h-8"
        >
          Previous
        </Button>
        <div className="text-xs">
          Page {currentPage} of {totalPages || 1}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={isLastPage}
          className="text-xs h-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
