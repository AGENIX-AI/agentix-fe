import { useState, useEffect } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { getOwnDocuments } from "@/api/documents";
import { getChildrenBlocksByType } from "@/api/documents";
import type { Document } from "@/api/documents";
import type { NoteCollection } from "@/api/documents/note-collections";
import { NoteCollectionsTable } from "../knowledgeNotes/NoteCollectionsTable";

import { Pagination } from "@/pages/instructor/components/modifyDocument/shared/Pagination";
import { Small } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TiptapContentBlocksViewer } from "@/components/editor/TiptapContentBlocksViewer";

export type MediaDocumentType = "image";

interface MediaCollectionsComponentProps {
  refreshTrigger?: number;
  onAddMediaCollection?: () => void;
  onSelectCollection?: (collection: Document) => void;
}

export function MediaCollectionsComponent({
  refreshTrigger,
  onAddMediaCollection,
  onSelectCollection,
}: MediaCollectionsComponentProps) {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [loadingDocumentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  // const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);

  const [showViewer, setShowViewer] = useState(false);
  const [viewerTitle, setViewerTitle] = useState("");
  const [viewerBlocks, setViewerBlocks] = useState<any[]>([]);
  const [viewerLoading, setViewerLoading] = useState(false);

  // Fetch documents when page, search, or refresh trigger changes
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const response = await getOwnDocuments({
          page_number: currentPage,
          page_size: pageSize,
          search: searchQuery || "",
          type: "media_collection",
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
  }, [currentPage, pageSize, searchQuery, refreshTrigger]);

  const handleRowClick = (documentId: string) => {
    try {
      const doc = documents.find((d) => d.id === documentId);
      if (!doc) return;
      onSelectCollection?.(doc);
    } catch (error) {
      console.error("Error selecting media collection:", error);
      toast.error("Failed to select media collection");
    }
  };

  const handleViewCollection = async (collection: NoteCollection) => {
    try {
      setViewerLoading(true);
      setViewerTitle(collection.title);
      setShowViewer(true);
      const blocks = await getChildrenBlocksByType(
        collection.id,
        "media_document"
      );
      const mapped = (blocks || [])
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((b) => ({
          id: b.id,
          type: b.type as any,
          data: b.data ?? {},
          order: b.order ?? 0,
        }));
      setViewerBlocks(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setViewerLoading(false);
    }
  };

  const mappedCollections: NoteCollection[] = documents.map((doc) => ({
    id: doc.id,
    user_id: doc.user_id,
    title: doc.title,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
    type: "note_collection",
    language: (doc as any).language,
  }));

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
                <NoteCollectionsTable
                  collections={mappedCollections}
                  isLoading={isLoading}
                  onCollectionSelect={(c) => handleRowClick(c.id)}
                  onView={handleViewCollection}
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

      {showViewer && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowViewer(false)}
          />
          <div className="relative ml-auto app-sidebar-panel bg-background border-l shadow-xl h-full flex flex-col w-[720px] max-w-[90vw]">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-sm font-semibold truncate pr-4">
                {viewerTitle}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-xs"
                onClick={() => setShowViewer(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {viewerLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : (
                <TiptapContentBlocksViewer
                  blocks={viewerBlocks as any}
                  className="min-h-[200px]"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
