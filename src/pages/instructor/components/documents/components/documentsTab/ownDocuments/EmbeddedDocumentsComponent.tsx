import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getOwnDocuments, linkDocument, unlinkDocument } from "@/api/documents";
import type { Document } from "@/api/documents";
import { useInstructor } from "@/contexts/InstructorContext";

import { SearchFilterBar } from "./SearchFilterBar";
import { Small } from "@/components/ui/typography";
import { DocumentTable } from "@/pages/instructor/components/modifyDocument/shared/DocumentTable";
import { Pagination } from "@/pages/instructor/components/modifyDocument/shared/Pagination";
import type { DocumentType } from "@/pages/instructor/components/modifyDocument/types";

// Using DocumentType from types.ts

interface EmbeddedDocumentsComponentProps {
  refreshAssistantDocuments?: () => Promise<void>;
  refreshTrigger?: number;
}

export function EmbeddedDocumentsComponent({
  refreshAssistantDocuments,
  refreshTrigger,
}: EmbeddedDocumentsComponentProps) {
  const { assistantId } = useInstructor();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDocumentIds, setLoadingDocumentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [documentType, setDocumentType] = useState<DocumentType>("document");

  // Fetch documents when page, search, document type, or refresh trigger changes
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const response = await getOwnDocuments({
          page_number: currentPage,
          page_size: pageSize,
          search: searchQuery || "",
          type: documentType === "all" ? undefined : documentType,
          assistant_id: assistantId || undefined, // Provide undefined when no assistant selected
          sort_by: "created_at",
          sort_order: 1,
        });

        if (response.success) {
          setDocuments(response.documents);
          setTotalItems(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [
    assistantId,
    currentPage,
    pageSize,
    searchQuery,
    documentType,
    refreshTrigger,
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-100 dark:bg-green-950/30 dark:border-green-900";
      case "pending":
      case "not_complete":
        return "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900";
      case "failed":
        return "text-red-600 bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100 dark:bg-gray-900/30 dark:border-gray-800";
    }
  };

  const getLinkStatus = (linked: boolean | undefined) => {
    return linked
      ? "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900"
      : "text-gray-600 bg-gray-50 border-gray-100 dark:bg-gray-900/30 dark:border-gray-800";
  };

  const handleLinkDocument = async (documentId: string) => {
    if (!assistantId) return;

    try {
      setLoadingDocumentIds((prev) => [...prev, documentId]);
      const response = await linkDocument(documentId, assistantId);
      if (response.success) {
        toast.success("Document linked successfully");
        // Update the document in the list
        setDocuments(
          documents.map((doc) =>
            doc.id === documentId ? { ...doc, linked: true } : doc
          )
        );
        // Refresh assistant documents to show the newly linked document
        refreshAssistantDocuments?.();
      } else {
        toast.error(response.message || "Failed to link document");
      }
    } catch (error) {
      console.error("Error linking document:", error);
      toast.error("Failed to link document");
    } finally {
      setLoadingDocumentIds((prev) => prev.filter((id) => id !== documentId));
    }
  };

  const handleUnlinkDocument = async (documentId: string) => {
    if (!assistantId) return;

    try {
      setLoadingDocumentIds((prev) => [...prev, documentId]);
      const response = await unlinkDocument(documentId, assistantId);
      if (response.success) {
        toast.success("Document unlinked successfully");
        // Update the document in the list
        setDocuments(
          documents.map((doc) =>
            doc.id === documentId ? { ...doc, linked: false } : doc
          )
        );
        // Refresh assistant documents to remove the unlinked document
        refreshAssistantDocuments?.();
      } else {
        toast.error(response.message || "Failed to unlink document");
      }
    } catch (error) {
      console.error("Error unlinking document:", error);
      toast.error("Failed to unlink document");
    } finally {
      setLoadingDocumentIds((prev) => prev.filter((id) => id !== documentId));
    }
  };

  return (
    <div className="my-3">
      <div className="mb-3">
        <Small className="font-semibold">Your Documents</Small>
      </div>
      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        documentType={documentType}
        setDocumentType={setDocumentType}
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {documents.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <h3 className="mt-2 text-xs font-medium">No documents found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                No documents available
              </p>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-hidden">
              <div className="w-full max-w-full overflow-x-auto">
                <DocumentTable
                  documents={documents}
                  getStatusColor={getStatusColor}
                  getLinkStatus={getLinkStatus}
                  showLinkedColumn={true}
                  onLinkDocument={handleLinkDocument}
                  onUnlinkDocument={handleUnlinkDocument}
                  loadingDocumentIds={loadingDocumentIds}
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
