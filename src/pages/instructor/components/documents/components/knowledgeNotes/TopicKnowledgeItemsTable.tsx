import { Loader2, Edit, Trash2 } from "lucide-react";
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
  return (
    <div className="relative w-full max-w-full">
      <div className="border rounded-md w-full max-w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs max-w-[250px]">Title</TableHead>
                <TableHead className="text-xs max-w-[300px]">
                  Content
                </TableHead>
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
                              onDelete?.(item.chunk_index);
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
    </div>
  );
}
