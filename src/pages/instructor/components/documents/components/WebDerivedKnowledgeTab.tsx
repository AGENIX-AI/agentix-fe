import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { getOwnDocuments, linkDocument, unlinkDocument } from "@/api/documents";
import type { Document } from "@/api/documents";
import { useInstructor } from "@/contexts/InstructorContext";

import { Pagination } from "@/pages/instructor/components/modifyDocument/shared/Pagination";
import { Small } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { AddWebDerivedKnowledgeSidebar } from "./webdeviredKnowledge/WebDerivedKnowledgeSidebar";
import { WebDerivedKnowledgeTable } from "./webdeviredKnowledge/WebDerivedKnowledgeTable";
import { IndexCrawlDocumentSidebar } from "./webdeviredKnowledge/IndexCrawlDocumentSidebar";
import { EditWebDerivedKnowledgeSidebar } from "./webdeviredKnowledge/EditWebDerivedKnowledgeSidebar";

export default function WebDerivedKnowledgeTab() {
  const { metaData, setMetaData, assistantId } = useInstructor();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDocumentIds, setLoadingDocumentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [showAddSidebar, setShowAddSidebar] = useState(false);
  const [showIndexSidebar, setShowIndexSidebar] = useState(false);
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
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
          type: "crawl_document", // Using a supported type
          sort_by: "created_at",
          sort_order: 1,
          assistant_id: assistantId || "",
        });

        if (response.success) {
          setDocuments(response.documents);
          setTotalItems(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching web derived knowledge:", error);
        toast.error("Failed to fetch web derived knowledge");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [currentPage, pageSize, searchQuery, refreshDocuments, assistantId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "crawl_completed":
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
      toast.info(`View functionality to be implemented ${documentId}`);
    } catch (error) {
      console.error("Error viewing document:", error);
      toast.error("Failed to view document");
    }
  };

  const handleIndexDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setShowIndexSidebar(true);
  };

  const handleRowClick = (documentId: string) => {
    try {
      setMetaData?.({
        ...metaData,
        currentWebDerivedKnowledgeId: documentId,
      });
    } catch (error) {
      console.error("Error selecting online sources:", error);
      toast.error("Failed to select online sources");
    }
  };

  const handleAddSidebarSuccess = () => {
    // Refresh the documents list
    setRefreshDocuments((prev) => prev + 1);
    // Close the sidebar
    setShowAddSidebar(false);
  };

  const handleEditSidebarSuccess = () => {
    // Refresh the documents list
    setRefreshDocuments((prev) => prev + 1);
    // Close the sidebar
    setShowEditSidebar(false);
  };

  const handleIndexSidebarSuccess = () => {
    // Refresh the documents list
    setRefreshDocuments((prev) => prev + 1);
    // Close the sidebar
    setShowIndexSidebar(false);
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="">
          <div className="mb-3 flex items-center justify-between">
            <Small className="font-semibold">Online Sources</Small>
            <Button
              onClick={() => setShowAddSidebar(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Online Sources
            </Button>
          </div>

          {/* Search bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search online sources..."
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
                    No online sources found
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add online sources by clicking the button above
                  </p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="w-full">
                    <WebDerivedKnowledgeTable
                      documents={documents}
                      getStatusColor={getStatusColor}
                      onView={handleViewDocument}
                      onIndex={handleIndexDocument}
                      onRowClick={handleRowClick}
                      loadingDocumentIds={loadingDocumentIds}
                      onLinkDocument={handleLinkDocument}
                      onUnlinkDocument={handleUnlinkDocument}
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
      </div>

      <AddWebDerivedKnowledgeSidebar
        isVisible={showAddSidebar}
        onClose={() => setShowAddSidebar(false)}
        onSuccess={handleAddSidebarSuccess}
        metaData={metaData}
        setMetaData={setMetaData}
      />

      <EditWebDerivedKnowledgeSidebar
        isVisible={showEditSidebar}
        onClose={() => setShowEditSidebar(false)}
        onSuccess={handleEditSidebarSuccess}
        documentId={selectedDocumentId}
      />

      <IndexCrawlDocumentSidebar
        isVisible={showIndexSidebar}
        onClose={() => setShowIndexSidebar(false)}
        onSuccess={handleIndexSidebarSuccess}
        documentId={selectedDocumentId}
      />
    </div>
  );
}
