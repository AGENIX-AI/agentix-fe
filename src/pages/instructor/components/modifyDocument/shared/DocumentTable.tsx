import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DocumentTableProps } from "../types";

export function DocumentTable({
  documents,
  getStatusColor,
  getLinkStatus,
  showLinkedColumn = false,
  onLinkDocument,
  onUnlinkDocument,
  loadingDocumentIds = [],
}: DocumentTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px] text-xs">Title</TableHead>
            <TableHead className="text-xs">Type</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            {showLinkedColumn && (
              <TableHead className="text-xs">Linked</TableHead>
            )}
            <TableHead className="text-xs">Created</TableHead>
            <TableHead className="text-right text-xs">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell>
                <div className="text-xs">{document.title}</div>
                <div className="text-xs text-muted-foreground">
                  {document.filename}
                </div>
              </TableCell>
              <TableCell className="text-xs">{document.type}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full border",
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
              {showLinkedColumn && (
                <TableCell>
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full border",
                      getLinkStatus?.(document.linked)
                    )}
                  >
                    {document.linked ? "Linked" : "Not Linked"}
                  </span>
                </TableCell>
              )}
              <TableCell className="text-xs">
                {new Date(document.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right text-xs">
                <div className="flex gap-2 justify-end">
                  {showLinkedColumn && (
                    loadingDocumentIds.includes(document.id) ? (
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    ) : document.linked ? (
                      <button
                        onClick={() => onUnlinkDocument?.(document.id)}
                        className="text-xs text-red-600 hover:underline"
                        disabled={loadingDocumentIds.includes(document.id)}
                      >
                        Unlink
                      </button>
                    ) : (
                      <button
                        onClick={() => onLinkDocument?.(document.id)}
                        className="text-xs text-green-600 hover:underline"
                        disabled={loadingDocumentIds.includes(document.id)}
                      >
                        Link
                      </button>
                    )
                  )}
                  <a
                    href={document.view_link || `#view-${document.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View
                  </a>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
