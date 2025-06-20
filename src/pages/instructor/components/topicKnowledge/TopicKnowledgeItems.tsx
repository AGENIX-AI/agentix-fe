import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getTopicKnowledgeItems, deleteTopicKnowledge } from "@/api/documents";
import type { TopicKnowledgeItem } from "@/api/documents";

import { Pagination } from "../modifyDocument/shared/Pagination";
import { TopicKnowledgeItemsTable } from "./TopicKnowledgeItemsTable";
import { AddKnowledgeChunkSidebar } from "./AddKnowledgeChunkSidebar";
import { ViewEditKnowledgeChunkSidebar } from "./ViewEditKnowledgeChunkSidebar";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { Small } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

interface TopicKnowledgeItemsProps {
  topicKnowledgeId: string;
}

export function TopicKnowledgeItems({
  topicKnowledgeId,
}: TopicKnowledgeItemsProps) {
  const [items, setItems] = useState<TopicKnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingItemIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [showAddChunkSidebar, setShowAddChunkSidebar] = useState(false);
  const [showViewEditSidebar, setShowViewEditSidebar] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TopicKnowledgeItem | null>(
    null
  );
  const [sidebarMode, setSidebarMode] = useState<"view" | "edit">("view");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TopicKnowledgeItem | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch items when page, search, or topicKnowledgeId changes
  useEffect(() => {
    const fetchItems = async () => {
      if (!topicKnowledgeId) return;

      setIsLoading(true);
      try {
        const response = await getTopicKnowledgeItems(topicKnowledgeId, {
          page_number: currentPage,
          page_size: pageSize,
          search: searchQuery || "",
          sort_by: "chunk_index",
          sort_order: 1,
        });

        if (response.success) {
          setItems(response.items);
          setTotalItems(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching topic knowledge items:", error);
        toast.error("Failed to fetch topic knowledge items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [topicKnowledgeId, currentPage, pageSize, searchQuery]);

  const handleSidebarSuccess = () => {
    // Refresh the items list
    const fetchItems = async () => {
      if (!topicKnowledgeId) return;

      setIsLoading(true);
      try {
        const response = await getTopicKnowledgeItems(topicKnowledgeId, {
          page_number: currentPage,
          page_size: pageSize,
          search: searchQuery || "",
          sort_by: "chunk_index",
          sort_order: 1,
        });

        if (response.success) {
          setItems(response.items);
          setTotalItems(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching topic knowledge items:", error);
        toast.error("Failed to fetch topic knowledge items");
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
      const response = await deleteTopicKnowledge(itemToDelete.chunk_index);

      if (response.success) {
        // Remove from local state
        setItems(
          items.filter((item) => item.chunk_index !== itemToDelete.chunk_index)
        );
        toast.success(
          response.message || "Topic knowledge item deleted successfully"
        );
        setShowDeleteDialog(false);
        setItemToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete topic knowledge item");
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
        <Small className="font-semibold">Knowledge Topic Details</Small>
        <Button
          onClick={() => setShowAddChunkSidebar(true)}
          className="px-3 py-1.5 text-xs"
          size="sm"
        >
          Add Knowledge Chunk
        </Button>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search topic knowledge items..."
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
              <h3 className="mt-2 text-xs font-medium">
                No topic knowledge items found
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                No items available for this topic knowledge
              </p>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-hidden">
              <div className="w-full max-w-full overflow-x-auto">
                <TopicKnowledgeItemsTable
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

      <AddKnowledgeChunkSidebar
        isVisible={showAddChunkSidebar}
        topicKnowledgeId={topicKnowledgeId}
        onClose={() => setShowAddChunkSidebar(false)}
        onSuccess={handleSidebarSuccess}
      />

      <ViewEditKnowledgeChunkSidebar
        isVisible={showViewEditSidebar}
        item={selectedItem}
        topicKnowledgeId={topicKnowledgeId}
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
