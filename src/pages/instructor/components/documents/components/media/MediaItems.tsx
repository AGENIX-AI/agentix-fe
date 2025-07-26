import { useState, useEffect } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { getImageDocument, deleteTopicKnowledge } from "@/api/documents";
import type { ImageDocument } from "@/api/documents";

import { MediaItemsTable } from "./MediaItemsTable";
import { AddMediaItemSidebar } from "./AddMediaItemSidebar";
import { ViewEditMediaItemSidebar } from "./ViewEditMediaItemSidebar";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { Small } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Pagination } from "../../../modifyDocument/shared/Pagination";

interface MediaItemsProps {
  mediaCollectionId: string;
  initialMediaItems?: ImageDocument[];
  initialTotalItems?: number;
  isInitialLoading?: boolean;
}

export function MediaItems({
  mediaCollectionId,
  initialMediaItems = [],
  initialTotalItems = 0,
  isInitialLoading = false,
}: MediaItemsProps) {
  const [items, setItems] = useState<ImageDocument[]>(initialMediaItems);
  const [isLoading, setIsLoading] = useState(isInitialLoading);
  const [loadingItemIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [showAddItemSidebar, setShowAddItemSidebar] = useState(false);
  const [showViewEditSidebar, setShowViewEditSidebar] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ImageDocument | null>(null);
  const [sidebarMode, setSidebarMode] = useState<"view" | "edit">("view");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ImageDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch items when page, search, or mediaCollectionId changes
  useEffect(() => {
    // Skip fetching if we're using initial data on first render
    if (
      isInitialLoading &&
      currentPage === 1 &&
      searchQuery === "" &&
      initialMediaItems.length > 0
    ) {
      return;
    }

    const fetchItems = async () => {
      if (!mediaCollectionId) return;

      setIsLoading(true);
      try {
        const response = await getImageDocument(mediaCollectionId, {
          page_number: currentPage,
          page_size: pageSize,
          search: searchQuery || "",
          sort_by: "chunk_index",
          sort_order: 1,
        });

        if (response.success) {
          setItems(response.documents);
          setTotalItems(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching media items:", error);
        toast.error("Failed to fetch media items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [
    mediaCollectionId,
    currentPage,
    pageSize,
    searchQuery,
    initialMediaItems,
    isInitialLoading,
  ]);

  const handleSidebarSuccess = () => {
    // Refresh the items list
    const fetchItems = async () => {
      if (!mediaCollectionId) return;

      setIsLoading(true);
      try {
        const response = await getImageDocument(mediaCollectionId, {
          page_number: currentPage,
          page_size: pageSize,
          search: searchQuery || "",
          sort_by: "chunk_index",
          sort_order: 1,
        });

        if (response.success) {
          setItems(response.documents);
          setTotalItems(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching media items:", error);
        toast.error("Failed to fetch media items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  };

  const handleViewItem = async (chunkIndex: string) => {
    try {
      const item = items.find((item) => item.chunk_index === chunkIndex);
      if (item) {
        setSelectedItem(item);
        setSidebarMode("view");
        setShowViewEditSidebar(true);
      }
    } catch (error) {
      console.error("Error viewing item:", error);
      toast.error("Failed to view item");
    }
  };

  const handleEditItem = async (chunkIndex: string) => {
    try {
      const item = items.find((item) => item.chunk_index === chunkIndex);
      if (item) {
        setSelectedItem(item);
        setSidebarMode("edit");
        setShowViewEditSidebar(true);
      }
    } catch (error) {
      console.error("Error editing item:", error);
      toast.error("Failed to edit item");
    }
  };

  const handleDeleteItem = async (chunkIndex: string) => {
    const item = items.find((item) => item.chunk_index === chunkIndex);
    if (item) {
      setItemToDelete(item);
      setShowDeleteDialog(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      // TODO: Implement delete API call for media items
      // For now, using the same API as topic knowledge
      const response = await deleteTopicKnowledge(itemToDelete.chunk_index);

      if (response.success) {
        // Remove from local state
        setItems(
          items.filter((item) => item.chunk_index !== itemToDelete.chunk_index)
        );
        toast.success(response.message || "Media item deleted successfully");
        setShowDeleteDialog(false);
        setItemToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete media item");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="my-3">
      <div className="mb-3 flex items-center justify-between">
        <Small className="font-semibold">Media Items</Small>
        <Button
          onClick={() => setShowAddItemSidebar(true)}
          className="px-3 py-1.5 text-xs"
          size="sm"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Media Item
        </Button>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search media items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <h3 className="mt-2 text-xs font-medium">No media items found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                No items available for this media collection
              </p>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-hidden">
              <div className="w-full max-w-full overflow-x-auto">
                <MediaItemsTable
                  items={items}
                  onView={handleViewItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  loadingItemIds={loadingItemIds}
                />
              </div>

              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  documentsCount={items.length}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            </div>
          )}
        </>
      )}

      <AddMediaItemSidebar
        isVisible={showAddItemSidebar}
        mediaCollectionId={mediaCollectionId}
        onClose={() => setShowAddItemSidebar(false)}
        onSuccess={handleSidebarSuccess}
      />

      <ViewEditMediaItemSidebar
        isVisible={showViewEditSidebar}
        item={selectedItem}
        mode={sidebarMode}
        onClose={() => {
          setShowViewEditSidebar(false);
          setSelectedItem(null);
        }}
        onSuccess={handleSidebarSuccess}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        isDeleting={isDeleting}
        itemTitle={itemToDelete?.title || ""}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
