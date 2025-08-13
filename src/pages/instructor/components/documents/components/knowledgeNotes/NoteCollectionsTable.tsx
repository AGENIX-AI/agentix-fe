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

// Types
export interface NoteCollectionsTableProps {
  collections: NoteCollection[];
  onCollectionSelect?: (collection: NoteCollection) => void;
  isLoading?: boolean;
}

// Constants
const TABLE_HEADERS = {
  name: "Collection Name",
  created: "Created",
  actions: "Actions",
} as const;

// Utility functions
const formatCollectionId = (id: string): string => `${id.slice(0, 8)}...`;

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString();

// Loading state component
const LoadingState = () => (
  <div className="flex justify-center items-center py-8">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
    <span className="ml-2 text-sm text-muted-foreground">
      Loading collections...
    </span>
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="text-center py-8">
    <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
    <p className="text-sm text-muted-foreground">No note collections found</p>
  </div>
);

// Collection row component
const CollectionRow = ({
  collection,
  onCollectionSelect,
}: {
  collection: NoteCollection;
  onCollectionSelect?: (collection: NoteCollection) => void;
}) => (
  <TableRow
    key={collection.id}
    className="cursor-pointer hover:bg-muted/50"
    onClick={() => onCollectionSelect?.(collection)}
  >
    <TableCell className="max-w-[300px] truncate">
      <div className="flex items-center gap-2">
        <FolderOpen className="h-4 w-4 text-primary" />
        <div>
          <div className="text-xs font-medium">{collection.title}</div>
          <div className="text-xs text-muted-foreground">
            ID: {formatCollectionId(collection.id)}
          </div>
        </div>
      </div>
    </TableCell>
    <TableCell className="text-xs">
      {formatDate(collection.created_at)}
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
);

export function NoteCollectionsTable({
  collections,
  onCollectionSelect,
  isLoading = false,
}: NoteCollectionsTableProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (collections.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="relative w-full max-w-full">
      <div className="border rounded-md w-full max-w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[500px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs max-w-[300px]">
                  {TABLE_HEADERS.name}
                </TableHead>
                <TableHead className="text-xs">
                  {TABLE_HEADERS.created}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {TABLE_HEADERS.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.map((collection) => (
                <CollectionRow
                  key={collection.id}
                  collection={collection}
                  onCollectionSelect={onCollectionSelect}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
