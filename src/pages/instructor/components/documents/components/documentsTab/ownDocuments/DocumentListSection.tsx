import { Search, Eye, Trash2, Repeat, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocumentTable } from "./DocumentTable";
import { Pagination } from "./Pagination";
import type { Document } from "@/api/page";
import type { JSX } from "react";

interface DocumentListSectionProps {
  title: string;
  icon: JSX.Element;
  documents: Document[];
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalItems: number;
  pageSize: number;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  targetMode: "original" | "reference";
  updatingModeDocumentId: string | null;
  getStatusColor: (status: string) => string;
  onView: (document: Document) => void;
  onDelete: (document: Document) => void;
  onMove: (document: Document, newMode: "original" | "reference") => void;
  onUpdateContent: (document: Document) => void;
  onRowClick?: (document: Document) => void;
}

export function DocumentListSection({
  title,
  icon,
  documents,
  isLoading,
  currentPage,
  setCurrentPage,
  totalItems,
  pageSize,
  searchQuery,
  setSearchQuery,
  targetMode,
  updatingModeDocumentId,
  getStatusColor,
  onView,
  onDelete,
  onMove,
  onUpdateContent,
  onRowClick,
}: DocumentListSectionProps) {
  return (
    <div className="rounded-md">
      <div className="flex items-center mb-4">
        {icon}
        <span className="text-sm font-semibold ml-2">{title}</span>
      </div>

      <div className="w-full max-w-full overflow-hidden">
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${targetMode} documents...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-border rounded-md text-xs"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <h3 className="mt-2 text-xs font-medium">No documents found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              No documents available in {targetMode} mode
            </p>
          </div>
        ) : (
          <>
            <div className="w-full max-w-full overflow-x-auto">
              <DocumentTable
                documents={documents}
                getStatusColor={getStatusColor}
                onRowClick={onRowClick}
                renderActions={(document) => (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(document);
                      }}
                      title="View document content"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateContent(document);
                      }}
                      title="Update content"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(document);
                      }}
                      title="Delete document"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMove(
                          document,
                          targetMode === "original" ? "reference" : "original"
                        );
                      }}
                      disabled={updatingModeDocumentId === document.id}
                      title={`Move to ${
                        targetMode === "original" ? "Reference" : "Original"
                      }`}
                    >
                      {updatingModeDocumentId === document.id ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-current" />
                      ) : (
                        <Repeat className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                )}
              />
            </div>

            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                documentsCount={documents.length}
                setCurrentPage={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
