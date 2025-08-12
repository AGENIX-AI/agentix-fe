import { Loader2, FolderOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { NoteCollection } from "@/api/documents/note-collections";

export interface NoteCollectionsTableProps {
  collections: NoteCollection[];
  onCollectionSelect?: (collection: NoteCollection) => void;
  isLoading?: boolean;
}

export function NoteCollectionsTable({
  collections,
  onCollectionSelect,
  isLoading = false,
}: NoteCollectionsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading collections...
        </span>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-8">
        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          No note collections found
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-full">
      <div className="border rounded-md w-full max-w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[500px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs max-w-[300px]">
                  Collection Name
                </TableHead>
                <TableHead className="text-xs">Created</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <TableRow
                  key={collection.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onCollectionSelect?.(collection)}
                >
                  <TableCell className="max-w-[300px] truncate">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs font-medium">
                          {collection.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {collection.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(collection.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCollectionSelect?.(collection);
                      }}
                      title="View collection documents"
                    >
                      View Documents
                    </Button>
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
