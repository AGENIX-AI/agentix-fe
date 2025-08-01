import { useState, useEffect } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { getOwnDocuments } from "@/api/documents";
import type { Document } from "@/api/documents";
import { useInstructor } from "@/contexts/InstructorContext";

import { Pagination } from "@/pages/instructor/components/modifyDocument/shared/Pagination";
import { MediaCollectionsTable } from "./MediaCollectionsTable";
import { Small } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditDocumentSidebar } from "../documentsTab/ownDocuments/EditDocumentSidebar";
import { DeleteDocumentDialog } from "../documentsTab/ownDocuments/DeleteDocumentDialog";

export type MediaDocumentType = "image";

interface MediaCollectionsComponentProps {
  refreshTrigger?: number;
  onAddMediaCollection?: () => void;
  setShowDetails?: (show: boolean) => void;
}

export function MediaCollectionsComponent({
  refreshTrigger,
  onAddMediaCollection,
  setShowDetails,
}: MediaCollectionsComponentProps) {
  const { t } = useTranslation();
  const { metaData, setMetaData } = useInstructor();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDocumentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);

  // Edit/Delete state
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  // Fetch documents when page, search, or refresh trigger changes
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const response = await getOwnDocuments({
          page_number: currentPage,
          page_size: pageSize,
          search: searchQuery || "",
          type: "image",
          sort_by: "created_at",
          sort_order: 1,
        });

        if (response.success) {
          setDocuments(response.documents);
          setTotalItems(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching media collections:", error);
        toast.error("Failed to fetch media collections");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [currentPage, pageSize, searchQuery, refreshTrigger, localRefreshTrigger]);

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

  const handleEditDocument = async (documentId: string) => {
    try {
      const document = documents.find((doc) => doc.id === documentId);
      if (document) {
        setSelectedDocument(document);
        setShowEditSidebar(true);
      }
    } catch (error) {
      console.error("Error editing document:", error);
      toast.error("Failed to edit document");
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const document = documents.find((doc) => doc.id === documentId);
      if (document) {
        setSelectedDocument(document);
        setShowDeleteDialog(true);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(t("documents.media.failedToDelete"));
    }
  };

  const handleEditSuccess = () => {
    // Refresh documents list by triggering a local refresh
    setLocalRefreshTrigger((prev) => prev + 1);
    setShowEditSidebar(false);
    setSelectedDocument(null);
  };

  const handleDeleteSuccess = () => {
    // Refresh documents list by triggering a local refresh
    setLocalRefreshTrigger((prev) => prev + 1);
    setShowDeleteDialog(false);
    setSelectedDocument(null);
  };

  const handleRowClick = (documentId: string) => {
    try {
      // Update metaData with currentMediaCollectionId
      setMetaData?.({
        ...metaData,
        currentMediaCollectionId: documentId,
      });
      setShowDetails?.(true);
    } catch (error) {
      console.error("Error selecting media collection:", error);
      toast.error("Failed to select media collection");
    }
  };

  return (
    <div className="">
      <div className="mb-3 flex items-center justify-between">
        <Small className="font-semibold">
          {t("documents.media.collections")}
        </Small>
        <Button
          onClick={() => {
            onAddMediaCollection?.();
          }}
          className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3 w-3 mr-1" />
          {t("documents.media.addCollection")}
        </Button>
      </div>

      {/* Simple search bar without type filter since we only show media collections */}
      <div className="mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search media collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-border rounded-md text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {documents.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <h3 className="mt-2 text-xs font-medium">
                No media collections found
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                No media collections available
              </p>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-hidden">
              <div className="w-full max-w-full overflow-x-auto">
                <MediaCollectionsTable
                  documents={documents}
                  getStatusColor={getStatusColor}
                  onEdit={handleEditDocument}
                  onDelete={handleDeleteDocument}
                  onRowClick={handleRowClick}
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

      {/* Edit Sidebar */}
      <EditDocumentSidebar
        isVisible={showEditSidebar}
        onClose={() => {
          setShowEditSidebar(false);
          setSelectedDocument(null);
        }}
        onSuccess={handleEditSuccess}
        document={selectedDocument}
      />

      {/* Delete Dialog */}
      <DeleteDocumentDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedDocument(null);
        }}
        onSuccess={handleDeleteSuccess}
        document={selectedDocument}
      />
    </div>
  );
}
