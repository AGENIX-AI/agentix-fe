import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getOwnDocuments } from "@/api/documents";
import type { Document } from "@/api/documents";
import { useInstructor } from "@/contexts/InstructorContext";

import { Pagination } from "@/pages/instructor/components/modifyDocument/shared/Pagination";
import { TopicKnowledgeTable } from "./TopicKnowledgeTable";
import { Small } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export type TopicKnowledgeDocumentType = "topic_knowledge";

interface TopicKnowledgeComponentProps {
  refreshTrigger?: number;
  onAddTopicKnowledge?: () => void;
  setShowDetails?: (show: boolean) => void;
}

export function TopicKnowledgeComponent({
  refreshTrigger,
  onAddTopicKnowledge,
  setShowDetails,
}: TopicKnowledgeComponentProps) {
  const { metaData, setMetaData } = useInstructor();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDocumentIds, setLoadingDocumentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch documents when page, search, or refresh trigger changes
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const response = await getOwnDocuments({
          page_number: currentPage,
          page_size: pageSize,
          search: searchQuery || "",
          type: "topic_knowledge",
          sort_by: "created_at",
          sort_order: 1,
        });

        if (response.success) {
          setDocuments(response.documents);
          setTotalItems(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching knowledge components:", error);
        toast.error("Failed to fetch knowledge components");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [currentPage, pageSize, searchQuery, refreshTrigger]);

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

  const handleViewDocument = async (documentId: string) => {
    try {
      // TODO: Implement view functionality
      toast.info(`View functionality to be implemented ${documentId}`);
    } catch (error) {
      console.error("Error viewing document:", error);
      toast.error("Failed to view document");
    }
  };

  const handleEditDocument = async (documentId: string) => {
    try {
      // TODO: Implement edit functionality
      toast.info(`Edit functionality to be implemented ${documentId}`);
    } catch (error) {
      console.error("Error editing document:", error);
      toast.error("Failed to edit document");
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      setLoadingDocumentIds((prev) => [...prev, documentId]);

      // TODO: Implement delete API call
      // For now, just show a confirmation toast
      const confirmed = window.confirm(
        "Are you sure you want to delete this knowledge component?"
      );

      if (confirmed) {
        // Remove from local state for now
        setDocuments(documents.filter((doc) => doc.id !== documentId));
        toast.success("Knowledge component deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    } finally {
      setLoadingDocumentIds((prev) => prev.filter((id) => id !== documentId));
    }
  };

  const handleRowClick = (documentId: string) => {
    try {
      // Update metaData with currentTopicKnowledgeId
      setMetaData?.({
        ...metaData,
        currentTopicKnowledgeId: documentId,
      });
      setShowDetails?.(true);
    } catch (error) {
      console.error("Error selecting knowledge component:", error);
      toast.error("Failed to select knowledge component");
    }
  };

  return (
    <div className="my-3">
      <div className="mb-3 flex items-center justify-between">
        <Small className="font-semibold">Knowledge Components</Small>
        <Button
          onClick={() => {
            onAddTopicKnowledge?.();
          }}
          className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
        >
          Add Knowledge Component
        </Button>
      </div>

      {/* Simple search bar without type filter since we only show knowledge components */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search knowledge components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
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
                No knowledge components found
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                No knowledge components available
              </p>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-hidden">
              <div className="w-full max-w-full overflow-x-auto">
                <TopicKnowledgeTable
                  documents={documents}
                  getStatusColor={getStatusColor}
                  onView={handleViewDocument}
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
    </div>
  );
}
