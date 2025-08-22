import { useState, useRef, useCallback, useEffect } from "react";
import { useInstructor } from "@/contexts/InstructorContext";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Search,
  X,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
// import { toast } from "sonner";
import { Pagination } from "@/pages/instructor/components/modifyDocument/shared/Pagination";
import { DocumentTable } from "../documentsTab/ownDocuments/DocumentTable";
import { useCollectionDocuments } from "../shared/useCollectionDocuments";
import type { Document, NoteCollection } from "@/api/documents";
import { AddKnowledgeChunkSidebar } from "./AddKnowledgeChunkSidebar";
import { UpdateDocumentSidebar } from "../documentsTab/ownDocuments/UpdateDocumentSidebar";
import { EditDocumentSidebar } from "../documentsTab/ownDocuments/EditDocumentSidebar";
import { DeleteDocumentDialog } from "../documentsTab/ownDocuments/DeleteDocumentDialog";
import { TiptapContentBlocksViewer } from "@/components/editor/TiptapContentBlocksViewer";
import { getPage } from "@/api/page";
import type { BlockData } from "@/api/page";
import type { ContentBlock } from "@/api/admin/helpCenter";
import { Input } from "@/components/ui/input";

// moved to shared hook

// Custom hook for managing metadata
const useMetadataUpdate = (collectionId: string) => {
  const { metaData, setMetaData } = useInstructor();

  useEffect(() => {
    if (setMetaData) {
      setMetaData((prev: any) => {
        const prevObj = prev || {};
        if (prevObj.currentTopicKnowledgeId === collectionId) return prevObj;
        return { ...prevObj, currentTopicKnowledgeId: collectionId };
      });
    }
  }, [collectionId, setMetaData]);

  return { metaData };
};

interface TopicKnowledgeDetailsProps {
  collection: NoteCollection;
  onBack: () => void;
}

export default function TopicKnowledgeDetails({
  collection,
  onBack,
}: TopicKnowledgeDetailsProps) {
  useMetadataUpdate(collection.id);

  // Pagination and search state
  const pageSize = 10;

  // Sidebar states
  const [showAddNoteSidebar, setShowAddNoteSidebar] = useState(false);
  const [editSidebar, setEditSidebar] = useState<{
    isVisible: boolean;
    document: Document | null;
  }>({
    isVisible: false,
    document: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    document: Document | null;
  }>({
    isOpen: false,
    document: null,
  });
  const [showViewSidebar, setShowViewSidebar] = useState(false);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [showUpdateSidebar, setShowUpdateSidebar] = useState(false);
  const [updateDocument, setUpdateDocument] = useState<Document | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch documents using custom hook
  const {
    documents,
    isLoading: isLoadingDocuments,
    totalItems,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    refetch: fetchDocuments,
  } = useCollectionDocuments(
    collection.id,
    "topic_knowledge",
    pageSize,
    "created_at",
    1
  );

  const getStatusColor = useCallback((status: string) => {
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
  }, []);

  // Event handlers
  const handleEditDocument = useCallback((document: Document) => {
    setEditSidebar({
      isVisible: true,
      document,
    });
  }, []);

  const handleDeleteDocument = useCallback((document: Document) => {
    setDeleteDialog({
      isOpen: true,
      document,
    });
  }, []);

  const handleViewDocument = useCallback((document: Document) => {
    setViewDocument(document);
    setShowViewSidebar(true);
  }, []);

  const handleOpenUpdateSidebar = useCallback((document: Document) => {
    setUpdateDocument(document);
    setShowUpdateSidebar(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditSidebar({
      isVisible: false,
      document: null,
    });
  }, []);

  const handleEditSuccess = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDeleteClose = useCallback(() => {
    setDeleteDialog({
      isOpen: false,
      document: null,
    });
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleCloseViewSidebar = useCallback(() => {
    setShowViewSidebar(false);
    setViewDocument(null);
  }, []);

  const handleCloseUpdateSidebar = useCallback(() => {
    setShowUpdateSidebar(false);
    setUpdateDocument(null);
  }, []);

  const handleUpdateSuccess = useCallback(() => {
    setShowUpdateSidebar(false);
    setUpdateDocument(null);
    fetchDocuments();
  }, [fetchDocuments]);

  const handleAddNoteSuccess = useCallback(() => {
    setShowAddNoteSidebar(false);
    fetchDocuments();
  }, [fetchDocuments]);

  // Render search input
  const renderSearchInput = () => (
    <div className="flex items-center space-x-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents in collection..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-2 border border-border rounded-md text-xs"
        />
      </div>
    </div>
  );

  // Render document table
  const renderDocumentTable = () => (
    <div className="w-full max-w-full overflow-hidden">
      <div className="w-full max-w-full overflow-x-auto">
        <DocumentTable
          documents={documents}
          getStatusColor={getStatusColor}
          onRowClick={handleViewDocument}
          renderActions={(document) => (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDocument(document);
                }}
                title="View document content"
              >
                <Eye className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenUpdateSidebar(document);
                }}
                title="Update content"
              >
                <Edit className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditDocument(document);
                }}
                title="Edit document"
              >
                <Edit className="h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDocument(document);
                }}
                title="Delete document"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
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
  );

  // Render view sidebar
  const renderViewSidebar = () => {
    if (!showViewSidebar) return null;

    return (
      <div className="fixed inset-0 z-50 flex">
        <div className="flex-1" onClick={handleCloseViewSidebar} />
        <div className="w-1/2 bg-background border-l shadow-lg flex flex-col">
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
          <TopicViewContent
            documentId={viewDocument?.id || ""}
            scrollRef={scrollContainerRef}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Collections
          </Button>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">{collection.title}</h1>
            <p className="text-xs text-muted-foreground">
              Collection created:{" "}
              {new Date(collection.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button
            onClick={() => setShowAddNoteSidebar(true)}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Document
          </Button>
        </div>

        {renderSearchInput()}

        {isLoadingDocuments ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {documents.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <h3 className="mt-2 text-xs font-medium">
                  No documents found in this collection
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  This collection doesn't contain any documents yet
                </p>
              </div>
            ) : (
              renderDocumentTable()
            )}
          </>
        )}
      </div>

      {/* Sidebars and dialogs */}
      <AddKnowledgeChunkSidebar
        isVisible={showAddNoteSidebar}
        topicKnowledgeId={collection.id}
        onClose={() => setShowAddNoteSidebar(false)}
        onSuccess={handleAddNoteSuccess}
      />

      <EditDocumentSidebar
        isVisible={editSidebar.isVisible}
        document={editSidebar.document}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
      />

      <DeleteDocumentDialog
        isOpen={deleteDialog.isOpen}
        document={deleteDialog.document}
        onClose={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
      />

      {renderViewSidebar()}

      <UpdateDocumentSidebar
        isOpen={showUpdateSidebar}
        document={(updateDocument as any) || null}
        onClose={handleCloseUpdateSidebar}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
}

function TopicViewContent({
  documentId,
  scrollRef,
}: {
  documentId: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!documentId) return;
      setLoading(true);
      try {
        const page = await getPage(documentId);
        const mapped: ContentBlock[] = (page.blocks || [])
          .sort((a: BlockData, b: BlockData) => (a.order ?? 0) - (b.order ?? 0))
          .map((b: BlockData, idx: number) => ({
            id: (b.id as string) || `block-${idx}-${Date.now()}`,
            type: (b.type as ContentBlock["type"]) || "paragraph",
            data: b.data || {},
            order: b.order ?? idx,
          }));
        if (active) setBlocks(mapped);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load document content:", e);
        if (active) setBlocks([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [documentId]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <TiptapContentBlocksViewer
          blocks={blocks}
          className="prose-sm"
          placeholder="No content"
        />
      )}
    </div>
  );
}
