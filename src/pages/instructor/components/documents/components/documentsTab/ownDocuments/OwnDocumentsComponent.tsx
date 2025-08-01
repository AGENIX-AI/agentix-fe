import { useState, useEffect } from "react";
import { Loader2, Edit, Trash2 } from "lucide-react";

import { getOwnDocuments } from "@/api/documents";
import type { Document } from "@/api/documents";
import { Large } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useInstructor } from "@/contexts/InstructorContext";
import { DocumentTable } from "./DocumentTable";
import { Pagination } from "./Pagination";
import { EditDocumentSidebar } from "./EditDocumentSidebar";
import { DeleteDocumentDialog } from "./DeleteDocumentDialog";

export type DocumentType =
  | "document"
  | "image"
  | "topic_knowledge"
  | "all"
  | undefined;

export default function OwnDocumentsComponent() {
  const { assistantId } = useInstructor();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Edit/Delete state
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Fetch documents when page, search, or document type changes
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!assistantId) return;
      setIsLoading(true);

      try {
        const response = await getOwnDocuments({
          page_number: currentPage,
          page_size: pageSize,
          search: searchQuery || (undefined as unknown as string),
          type: "document",
          assistant_id: assistantId, // Optional: filter by assistant ID if needed
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
  }, [assistantId, currentPage, pageSize, searchQuery]);

  const handleEdit = (document: Document) => {
    setSelectedDocument(document);
    setShowEditSidebar(true);
  };

  const handleDelete = (document: Document) => {
    setSelectedDocument(document);
    setShowDeleteDialog(true);
  };

  const handleEditSuccess = () => {
    // Refresh documents list
    const fetchDocuments = async () => {
      if (!assistantId) return;
      setIsLoading(true);

      try {
        const response = await getOwnDocuments({
          page_number: currentPage,
          page_size: pageSize,
          search: searchQuery || (undefined as unknown as string),
          type: "document",
          assistant_id: assistantId,
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
  };

  const handleDeleteSuccess = () => {
    handleEditSuccess(); // Same refresh logic
  };

  const renderActions = (document: Document) => {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(document);
          }}
          className="h-6 px-2 text-xs"
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(document);
          }}
          className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </>
    );
  };

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

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-20 bg-background flex items-center h-18 border-b w-full p-4">
        <Large className="font-bold tracking-tight">My Documents</Large>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              <div>
                <DocumentTable
                  documents={documents}
                  getStatusColor={getStatusColor}
                  renderActions={renderActions}
                />

                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  documentsCount={documents.length}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Edit Sidebar */}
      <EditDocumentSidebar
        isVisible={showEditSidebar}
        onClose={() => setShowEditSidebar(false)}
        onSuccess={handleEditSuccess}
        document={selectedDocument}
      />
      
      {/* Delete Dialog */}
      <DeleteDocumentDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onSuccess={handleDeleteSuccess}
        document={selectedDocument}
      />
    </div>
  );
}
