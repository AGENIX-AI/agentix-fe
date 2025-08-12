import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import { getOwnDocuments, getDocumentBlocks } from "@/api/documents";
import type { Document, DocumentBlock } from "@/api/documents";
import { useInstructor } from "@/contexts/InstructorContext";

import { Pagination } from "@/pages/instructor/components/modifyDocument/shared/Pagination";
import { Small } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { AddWebDerivedKnowledgeSidebar } from "./webdeviredKnowledge/WebDerivedKnowledgeSidebar";
import { WebDerivedKnowledgeTable } from "./webdeviredKnowledge/WebDerivedKnowledgeTable";
import { EditDocumentSidebar } from "./documentsTab/ownDocuments/EditDocumentSidebar";
import { DeleteDocumentDialog } from "./documentsTab/ownDocuments/DeleteDocumentDialog";
import { DocumentBlocksRenderer } from "@/components/reused/documents";

import WebDerivedKnowledgeDetailsView from "./webdeviredKnowledge/WebDerivedKnowledgeDetailsView";
import { Input } from "@/components/ui/input";
import { t } from "i18next";

export default function WebDerivedKnowledgeTab() {
  const { metaData, setMetaData, assistantId } = useInstructor();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [showAddSidebar, setShowAddSidebar] = useState(false);
  const [loadingDocumentIds] = useState<string[]>([]);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [showDetailsView, setShowDetailsView] = useState(false);

  // Edit/Delete state
  const [showEditSidebar, setShowEditSidebar] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocumentForAction, setSelectedDocumentForAction] =
    useState<Document | null>(null);

  // View sidebar states
  const [showViewSidebar, setShowViewSidebar] = useState(false);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [documentBlocks, setDocumentBlocks] = useState<DocumentBlock[]>([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isLoadingMoreBlocks, setIsLoadingMoreBlocks] = useState(false);
  const [currentBlocksPage, setCurrentBlocksPage] = useState(1);
  const [hasMoreBlocks, setHasMoreBlocks] = useState(true);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Load more blocks function
  const loadMoreBlocks = useCallback(async () => {
    if (!viewDocument || isLoadingMoreBlocks || !hasMoreBlocks) return;

    setIsLoadingMoreBlocks(true);
    const nextPage = currentBlocksPage + 1;

    try {
      const response = await getDocumentBlocks(viewDocument.id, {
        page_number: nextPage,
        page_size: 20,
        sort_order: 0,
        sort_by: "order",
      });

      if (response.success && response.items && response.items.length > 0) {
        setDocumentBlocks((prev) => {
          // Handle new API structure where items have nested block objects
          const newBlocks = response.items;

          // For the new structure, we need to check if we already have these blocks
          // by comparing the block.id from the nested structure
          if (newBlocks.length > 0 && "block" in newBlocks[0]) {
            // New structure: check for duplicates using block.id
            const existingIds = new Set(
              prev.map((block) =>
                "block" in block ? (block as any).block.id : block.id
              )
            );
            const filteredBlocks = newBlocks.filter(
              (item: any) => !existingIds.has(item.block.id)
            );
            return [...prev, ...filteredBlocks];
          } else {
            // Old structure: check for duplicates using block.id directly
            const existingIds = new Set(prev.map((block) => block.id));
            const filteredBlocks = newBlocks.filter(
              (block: any) => !existingIds.has(block.id)
            );
            return [...prev, ...filteredBlocks];
          }
        });
        setCurrentBlocksPage(nextPage);

        // Check if we have more pages based on total items and current page
        const totalPages = Math.ceil(response.total_items / 20);
        const hasMore = nextPage < totalPages;

        setHasMoreBlocks(hasMore);
        setTotalBlocks(response.total_items);
      } else {
        // No more items, set hasMoreBlocks to false
        setHasMoreBlocks(false);
      }
    } catch (error) {
      console.error("Error loading more blocks:", error);
      toast.error("Failed to load more content");
    } finally {
      setIsLoadingMoreBlocks(false);
    }
  }, [viewDocument, isLoadingMoreBlocks, hasMoreBlocks, currentBlocksPage]);

  // Infinite scroll effect
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !hasMoreBlocks || isLoadingMoreBlocks) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      // Additional safety check: don't load if we've already loaded all items
      if (
        scrollTop + clientHeight >= scrollHeight - 100 &&
        documentBlocks.length < totalBlocks
      ) {
        loadMoreBlocks();
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [loadMoreBlocks, hasMoreBlocks, isLoadingMoreBlocks]);

  // Cleanup effect to reset pagination when view document changes
  useEffect(() => {
    if (viewDocument) {
      setCurrentBlocksPage(1);
      setHasMoreBlocks(true);
      setTotalBlocks(0);
    }
  }, [viewDocument?.id]);

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

  const handleRowClick = (documentId: string) => {
    try {
      // Find the document by ID
      const document = documents.find((doc) => doc.id === documentId);
      if (document) {
        setSelectedDocument(document);
        setShowDetailsView(true);
        setMetaData?.({
          ...metaData,
          currentWebDerivedKnowledgeId: documentId,
        });
      }
    } catch (error) {
      console.error("Error selecting online sources:", error);
      toast.error("Failed to select online sources");
    }
  };

  const handleBackFromDetails = () => {
    setShowDetailsView(false);
    setSelectedDocument(null);
  };

  const handleAddSidebarSuccess = () => {
    // Refresh the documents list
    setRefreshDocuments((prev) => prev + 1);
    // Close the sidebar
    setShowAddSidebar(false);
  };

  // View handlers
  const handleViewDocument = async (document: Document) => {
    setViewDocument(document);
    setShowViewSidebar(true);
    setIsLoadingBlocks(true);
    setDocumentBlocks([]);
    setCurrentBlocksPage(1);
    setHasMoreBlocks(true);
    setTotalBlocks(0);

    try {
      const response = await getDocumentBlocks(document.id, {
        page_number: 1,
        page_size: 20,
        sort_order: 0,
        sort_by: "order",
      });

      if (response.success) {
        setDocumentBlocks(response.items);
        setTotalBlocks(response.total_items);
        setHasMoreBlocks(
          response.items.length === 20 && response.total_items > 20
        );
      } else {
        toast.error("Failed to load document content");
      }
    } catch (error) {
      console.error("Error fetching document blocks:", error);
      toast.error("Failed to load document content");
    } finally {
      setIsLoadingBlocks(false);
    }
  };

  const handleCloseViewSidebar = () => {
    setShowViewSidebar(false);
    setViewDocument(null);
    setDocumentBlocks([]);
    setCurrentBlocksPage(1);
    setHasMoreBlocks(true);
    setTotalBlocks(0);
  };

  // Edit and delete handlers
  const handleEdit = (documentId: string) => {
    const document = documents.find((doc) => doc.id === documentId);
    if (document) {
      setSelectedDocumentForAction(document);
      setShowEditSidebar(true);
    }
  };

  const handleDelete = (documentId: string) => {
    const document = documents.find((doc) => doc.id === documentId);
    if (document) {
      setSelectedDocumentForAction(document);
      setShowDeleteDialog(true);
    }
  };

  const handleEditSuccess = () => {
    setShowEditSidebar(false);
    setSelectedDocumentForAction(null);
    // Refresh the documents list
    setRefreshDocuments((prev) => prev + 1);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    setSelectedDocumentForAction(null);
    // Refresh the documents list
    setRefreshDocuments((prev) => prev + 1);
  };

  // Show details view if selected
  if (showDetailsView && selectedDocument) {
    return (
      <WebDerivedKnowledgeDetailsView
        document={selectedDocument}
        onBack={handleBackFromDetails}
      />
    );
  }

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
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder={t("documents.webKnowledge.searchPlaceholder")}
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
                      onRowClick={handleRowClick}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleViewDocument}
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
      </div>

      <AddWebDerivedKnowledgeSidebar
        isVisible={showAddSidebar}
        onClose={() => setShowAddSidebar(false)}
        onSuccess={handleAddSidebarSuccess}
        metaData={metaData}
        setMetaData={setMetaData}
      />

      {/* Edit Document Sidebar */}
      {selectedDocumentForAction && (
        <EditDocumentSidebar
          isVisible={showEditSidebar}
          onClose={() => {
            setShowEditSidebar(false);
            setSelectedDocumentForAction(null);
          }}
          onSuccess={handleEditSuccess}
          document={selectedDocumentForAction}
        />
      )}

      {/* Delete Document Dialog */}
      {selectedDocumentForAction && (
        <DeleteDocumentDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedDocumentForAction(null);
          }}
          onSuccess={handleDeleteSuccess}
          document={selectedDocumentForAction}
        />
      )}

      {/* View Document Sidebar */}
      {showViewSidebar && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1" onClick={handleCloseViewSidebar} />
          <div className="w-1/2 bg-background border-l shadow-lg flex flex-col">
            {/* Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between h-18">
              <div>
                <h2 className="text-lg font-semibold">
                  {viewDocument?.title || "Web Derived Knowledge Content"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {viewDocument?.url}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseViewSidebar}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-6"
            >
              {viewDocument && (
                <DocumentBlocksRenderer
                  documentId={viewDocument.id}
                  pageSize={20}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
