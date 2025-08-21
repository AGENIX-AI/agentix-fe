import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { DocumentBlocksRenderer } from "@/components/reused/documents";
import type { Document } from "@/api/page";

interface ViewDocumentSidebarProps {
  isOpen: boolean;
  document: Document | null;
  onClose: () => void;
}

export function ViewDocumentSidebar({
  isOpen,
  document,
  onClose,
}: ViewDocumentSidebarProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-1/2 bg-background border-l shadow-lg flex flex-col">
        <div className="border-b px-6 py-4 flex items-center justify-between h-18">
          <div>
            <h2 className="text-lg font-semibold">
              {document?.title || "Document Content"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {document?.file_name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {document && (
            <DocumentBlocksRenderer documentId={document.id} pageSize={20} />
          )}
        </div>
      </div>
    </div>
  );
}
