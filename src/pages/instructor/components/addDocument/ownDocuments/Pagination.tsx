import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  documentsCount: number;
  setCurrentPage: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  documentsCount,
  setCurrentPage,
}: PaginationProps) {
  return (
    <div className="flex justify-between items-center mt-3">
      <span className="text-xs text-muted-foreground">
        Showing {documentsCount} of {totalItems} documents
      </span>
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          className="text-xs w-20"
        >
          Previous
        </Button>
        <span className="text-xs">
          Page {currentPage} of {Math.ceil(totalItems / pageSize)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= Math.ceil(totalItems / pageSize)}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="text-xs w-20"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
