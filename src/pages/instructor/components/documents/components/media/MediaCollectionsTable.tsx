import { cn } from "@/lib/utils";
import { Loader2, Edit, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Document } from "@/api/documents";

export interface MediaCollectionsTableProps {
  documents: Document[];
  getStatusColor: (status: string) => string;
  onEdit?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
  onView?: (document: Document) => void;
  onRowClick?: (documentId: string) => void;
  loadingDocumentIds?: string[];
}

export function MediaCollectionsTable({
  documents,
  getStatusColor,
  onEdit,
  onDelete,
  onView,
  onRowClick,
  loadingDocumentIds = [],
}: MediaCollectionsTableProps) {
  return (
    <div className="relative w-full">
      <div className="border rounded-md overflow-hidden">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs w-[40%]">Title</TableHead>

              <TableHead className="text-xs w-[15%]">Status</TableHead>
              <TableHead className="text-xs w-[15%]">Created</TableHead>
              <TableHead className="text-right text-xs w-[15%]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow
                key={document.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onRowClick?.(document.id)}
              >
                <TableCell className="w-[40%] truncate">
                  <div className="text-xs truncate">{document.title}</div>
                  {document.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {document.description}
                    </div>
                  )}
                </TableCell>

                <TableCell className="w-[15%]">
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full border whitespace-nowrap",
                      getStatusColor(document.upload_status)
                    )}
                  >
                    {document.upload_status === "completed"
                      ? "Completed"
                      : document.upload_status === "not_complete"
                      ? "Processing"
                      : document.upload_status === "pending"
                      ? "Pending"
                      : "Failed"}
                  </span>
                </TableCell>
                <TableCell className="text-xs w-[15%] truncate">
                  {new Date(document.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right text-xs w-[15%]">
                  <div className="flex items-center gap-1 justify-end">
                    {loadingDocumentIds.includes(document.id) ? (
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    ) : (
                      <>
                        {/* View Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onView?.(document);
                          }}
                          title="View media collection"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>

                        {/* Separator */}
                        <div className="h-4 w-px bg-border mx-1" />

                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(document.id);
                          }}
                          title="Edit media collection"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>

                        {/* Separator */}
                        <div className="h-4 w-px bg-border mx-1" />

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(document.id);
                          }}
                          title="Delete media collection"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
