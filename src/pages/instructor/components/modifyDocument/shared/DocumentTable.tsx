import { cn } from "@/lib/utils";
import { useState } from "react";
import { Loader2, Image } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DocumentTableProps } from "../types";
import { DocumentViewerDialog } from "./DocumentViewerDialog";
import { ImageViewerSidebar } from "./ImageViewerSidebar";

export function DocumentTable({
  documents,
  getStatusColor,
  getLinkStatus,
  showLinkedColumn = false,
  onLinkDocument,
  onUnlinkDocument,
  loadingDocumentIds = [],
}: DocumentTableProps) {
  const [showImageSidebar, setShowImageSidebar] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );

  const handleImageClick = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setShowImageSidebar(true);
  };

  const handleCloseSidebar = () => {
    setShowImageSidebar(false);
    setSelectedDocumentId(null);
  };

  return (
    <div className="relative w-full max-w-full">
      <div
        className={`transition-all duration-300 ease-in-out w-full max-w-full ${
          showImageSidebar ? "mr-[700px]" : "mr-0"
        }`}
      >
        <div className="border rounded-md w-full max-w-full overflow-hidden">
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs max-w-[200px]">Title</TableHead>
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
                    <TableCell className="max-w-[200px] truncate">
                      <div className="text-xs ">{document.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {document.filename}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {document.type === "image" ? "Image" : "Document"}
                    </TableCell>
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
                        {showLinkedColumn &&
                          (loadingDocumentIds.includes(document.id) ? (
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          ) : document.linked ? (
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
                          ))}
                        <button
                          onClick={() => handleImageClick(document.id)}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          title="View document images"
                        >
                          <Image className="h-3 w-3" />
                          Image
                        </button>
                        <DocumentViewerDialog
                          document={document}
                          trigger={
                            <button className="text-xs text-primary hover:underline">
                              View
                            </button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <ImageViewerSidebar
        isVisible={showImageSidebar}
        documentId={selectedDocumentId}
        onClose={handleCloseSidebar}
      />
    </div>
  );
}
