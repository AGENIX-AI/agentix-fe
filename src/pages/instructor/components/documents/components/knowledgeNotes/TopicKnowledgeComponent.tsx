import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { getDocumentBlocks } from "@/api/documents";
import type { Document, DocumentBlock } from "@/api/documents";
import {
  getNoteCollections,
  getCollectionDocuments,
} from "@/api/documents/note-collections";
import type { NoteCollection } from "@/api/documents/note-collections";
import { useInstructor } from "@/contexts/InstructorContext";

import { Pagination } from "@/pages/instructor/components/modifyDocument/shared/Pagination";
import { TopicKnowledgeTable } from "./TopicKnowledgeTable";
import { NoteCollectionsTable } from "./NoteCollectionsTable";
import { AddKnowledgeChunkSidebar } from "./AddKnowledgeChunkSidebar";
import { Small } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditDocumentSidebar } from "../documentsTab/ownDocuments/EditDocumentSidebar";
import { DeleteDocumentDialog } from "../documentsTab/ownDocuments/DeleteDocumentDialog";
import { DocumentBlocksRenderer } from "@/components/reused/documents";

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
  const { t } = useTranslation();

  // Collections state
  const [collections, setCollections] = useState<NoteCollection[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<NoteCollection | null>(null);
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [loadingDocumentIds] = useState<string[]>([]);

  // Common state
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

  // Add document sidebar state
  const [showAddDocumentSidebar, setShowAddDocumentSidebar] = useState(false);

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

  // Fetch collections on component mount and refresh trigger changes
  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoadingCollections(true);
      try {
        const response = await getNoteCollections({
          page_number: 1,
          page_size: 50, // Get more collections to show all available
          search: searchQuery || "",
          sort_by: "created_at",
          sort_order: 1,
        });

        if (response.success) {
          setCollections(response.collections);
        }
      } catch (error) {
        console.error("Error fetching note collections:", error);
        toast.error(t("documents.knowledgeNotes.failedToFetchCollections"));
      } finally {
        setIsLoadingCollections(false);
      }
    };

    fetchCollections();
  }, [searchQuery, refreshTrigger, localRefreshTrigger]);

  // Fetch documents when a collection is selected
  const fetchCollectionDocuments = async (collectionId: string) => {
    setIsLoadingDocuments(true);
    try {
      const response = await getCollectionDocuments(collectionId, {
        page_number: currentPage,
        page_size: pageSize,
        search: "", // Reset search for documents
        sort_by: "created_at",
        sort_order: 1,
      });

      if (response.success) {
        setDocuments(response.documents);
        setTotalItems(response.total_count);
      }
    } catch (error) {
      console.error("Error fetching collection documents:", error);
      toast.error(t("documents.knowledgeNotes.failedToFetchDocuments"));
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Handle collection selection
  const handleCollectionSelect = (collection: NoteCollection) => {
    setSelectedCollection(collection);
    setCurrentPage(1); // Reset to first page
    setDocuments([]); // Clear current documents
    fetchCollectionDocuments(collection.id);
  };

  // Handle back to collections
  const handleBackToCollections = () => {
    setSelectedCollection(null);
    setDocuments([]);
    setCurrentPage(1);
  };

  // Handle add document sidebar
  const handleAddDocumentClose = () => {
    setShowAddDocumentSidebar(false);
  };

  const handleAddDocumentSuccess = () => {
    setShowAddDocumentSidebar(false);
    // Refresh documents list for the selected collection
    if (selectedCollection) {
      fetchCollectionDocuments(selectedCollection.id);
    }
    setLocalRefreshTrigger((prev) => prev + 1);
  };

  // Refetch documents when page changes for selected collection
  useEffect(() => {
    if (selectedCollection && currentPage > 1) {
      fetchCollectionDocuments(selectedCollection.id);
    }
  }, [currentPage, selectedCollection]);

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

      if (response.items && response.items.length > 0) {
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
      toast.error(t("documents.knowledgeNotes.failedToDelete"));
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

      if (response.items.length > 0) {
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

  return (
    <div className="">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {selectedCollection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToCollections}
              className="text-xs px-2 py-1 h-7"
            >
              ← Back
            </Button>
          )}
          <Small className="font-semibold">
            {selectedCollection
              ? `${selectedCollection.title} - Documents`
              : t("documents.knowledgeNotes.title")}
          </Small>
        </div>
        <Button
          onClick={() => {
            if (selectedCollection) {
              // Show AddKnowledgeChunkSidebar for adding document to collection
              setShowAddDocumentSidebar(true);
            } else {
              // Show collection creation dialog
              onAddTopicKnowledge?.();
            }
          }}
          className="px-3 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3 w-3 mr-1" />
          {selectedCollection
            ? t("documents.knowledgeNotes.addDocument")
            : t("documents.knowledgeNotes.addCollection")}
        </Button>
      </div>

      {/* Search bar - only show for collections view */}
      {!selectedCollection && (
        <div className="mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("documents.knowledgeNotes.searchCollections")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-border rounded-md text-xs"
            />
          </div>
        </div>
      )}

      {/* Show collections table when no collection is selected */}
      {!selectedCollection ? (
        <NoteCollectionsTable
          collections={collections}
          onCollectionSelect={handleCollectionSelect}
          isLoading={isLoadingCollections}
        />
      ) : (
        /* Show documents table when a collection is selected */
        <>
          {isLoadingDocuments ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {documents.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <h3 className="mt-2 text-xs font-medium">
                    No documents in this collection
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    This collection doesn't contain any documents yet.
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-full overflow-hidden">
                  <div className="w-full max-w-full overflow-x-auto">
                    <TopicKnowledgeTable
                      documents={documents}
                      onEdit={handleEditDocument}
                      onDelete={handleDeleteDocument}
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

      {/* View Document Sidebar */}
      {showViewSidebar && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1" onClick={handleCloseViewSidebar} />
          <div className="w-1/2 bg-background border-l shadow-lg flex flex-col">
            {/* Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between h-18">
              <div>
                <h2 className="text-lg font-semibold">
                  {viewDocument?.title || "Document Content"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {viewDocument?.file_name}
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

      {/* Add Document Sidebar */}
      {selectedCollection && (
        <AddKnowledgeChunkSidebar
          isVisible={showAddDocumentSidebar}
          topicKnowledgeId={selectedCollection.id}
          onClose={handleAddDocumentClose}
          onSuccess={handleAddDocumentSuccess}
        />
      )}
    </div>
  );
}
