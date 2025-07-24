import { Loader2, Eye, Database } from "lucide-react";
import type { Document } from "@/api/documents";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WebDerivedKnowledgeTableProps {
  documents: Document[];
  getStatusColor: (status: string) => string;
  onView: (documentId: string) => void;
  onIndex: (documentId: string) => void;
  onRowClick: (documentId: string) => void;
  loadingDocumentIds: string[];
  onLinkDocument: (documentId: string) => void;
  onUnlinkDocument: (documentId: string) => void;
}

export function WebDerivedKnowledgeTable({
  documents,
  getStatusColor,
  onView,
  onIndex,
  onRowClick,
  loadingDocumentIds,
  onLinkDocument,
  onUnlinkDocument,
}: WebDerivedKnowledgeTableProps) {
  // Function to get a user-friendly status text
  const getStatusText = (status: string): string => {
    switch (status) {
      case "completed":
        return "Completed";
      case "not_complete":
        return "In Progress";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      case "crawl_completed":
        return "Crawl Completed";
      default:
        return (
          status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
        );
    }
  };

  return (
    <div className="relative w-full max-w-full">
      <div className="border rounded-md w-full max-w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs ">Title</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Created</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow
                  key={document.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onRowClick(document.id)}
                >
                  <TableCell className=" truncate">
                    <div className="text-xs font-medium">{document.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {document.url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full border",
                        getStatusColor(document.upload_status)
                      )}
                    >
                      {getStatusText(document.upload_status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(document.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <div className="flex gap-2 justify-end">
                      {loadingDocumentIds.includes(document.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ) : (
                        <>
                          {document.linked ? (
                            <button
                              onClick={() => onUnlinkDocument?.(document.id)}
                              className="text-xs text-red-600 hover:underline"
                              disabled={loadingDocumentIds.includes(
                                document.id
                              )}
                            >
                              Unlink
                            </button>
                          ) : (
                            <button
                              onClick={() => onLinkDocument?.(document.id)}
                              className="text-xs text-green-600 hover:underline"
                              disabled={loadingDocumentIds.includes(
                                document.id
                              )}
                            >
                              Link
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(document.id);
                            }}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            title="View web derived knowledge"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                          {/* <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(document.id);
                            }}
                            className="text-xs text-amber-600 hover:underline flex items-center gap-1"
                            title="Edit web derived knowledge"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(document.id);
                            }}
                            className="text-xs text-red-600 hover:underline flex items-center gap-1"
                            title="Delete web derived knowledge"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button> */}
                          {document.upload_status === "crawl_completed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onIndex(document.id);
                              }}
                              className="text-xs text-green-600 hover:underline flex items-center gap-1"
                              title="Index web derived knowledge"
                            >
                              <Database className="h-3 w-3" />
                              Index
                            </button>
                          )}
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
    </div>
  );
}
