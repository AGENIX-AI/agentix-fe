import { useState } from "react";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deletePage } from "@/api/page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopicKnowledgeItem } from "@/api/documents";

export interface TopicKnowledgeItemsTableProps {
  items: TopicKnowledgeItem[];
  onView?: (documentId: string) => void;
  onEdit?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
  loadingItemIds?: string[];
}

export function TopicKnowledgeItemsTable({
  items,
  onView,
  onEdit,
  onDelete,
  loadingItemIds = [],
}: TopicKnowledgeItemsTableProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      const res = await deletePage(confirmDeleteId);
      if (res.success) {
        toast.success("Deleted successfully");
        setConfirmDeleteId(null);
        onDelete?.(confirmDeleteId);
      }
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative w-full max-w-full">
      <div className="border rounded-md w-full max-w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs max-w-[250px]">Title</TableHead>
                <TableHead className="text-xs max-w-[300px]">Content</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow
                  key={item.chunk_index}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onView?.(item.chunk_index)}
                >
                  <TableCell className="max-w-[250px] truncate">
                    <div className="text-xs font-medium">{item.title}</div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="text-xs line-clamp-3">{item.content}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="text-xs">{item.type}</div>
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <div className="flex gap-2 justify-end">
                      {loadingItemIds.includes(item.chunk_index) ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit?.(item.chunk_index);
                            }}
                            className="text-xs text-amber-600 hover:underline flex items-center gap-1"
                            title="Edit item"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(item.chunk_index);
                            }}
                            className="text-xs text-red-600 hover:underline flex items-center gap-1"
                            title="Delete item"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={() => (isDeleting ? null : setConfirmDeleteId(null))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Delete item
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
