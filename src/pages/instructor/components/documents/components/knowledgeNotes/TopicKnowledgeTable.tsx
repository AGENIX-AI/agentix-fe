import { Loader2, Edit, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Document } from "@/api/documents";

export interface TopicKnowledgeTableProps {
  documents: Document[];
  onEdit?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
  onView?: (document: Document) => void;
  loadingDocumentIds?: string[];
}

export function TopicKnowledgeTable({
  documents,
  onEdit,
  onDelete,
  onView,
  loadingDocumentIds = [],
}: TopicKnowledgeTableProps) {
  return (
    <div className="relative w-full max-w-full">
      <div className="border rounded-md w-full max-w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="w-full min-w-[500px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs max-w-[200px]">Title</TableHead>
                <TableHead className="text-xs">Language</TableHead>
                <TableHead className="text-xs">Created</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id} className="hover:bg-muted/50">
                  <TableCell className="max-w-[200px] truncate">
                    <div className="text-xs">{document.title}</div>
                    {document.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {document.description}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-xs">
                    {document.language || "N/A"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(document.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <div className="flex items-center gap-1 justify-end">
                      {loadingDocumentIds.includes(document.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ) : (
                        <>
                          {/* View Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              onView?.(document);
                            }}
                            title="View knowledge component"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>

                          {/* Separator */}
                          <div className="h-4 w-px bg-border mx-1" />

                          {/* Edit Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit?.(document.id);
                            }}
                            title="Edit knowledge component"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>

                          {/* Separator */}
                          <div className="h-4 w-px bg-border mx-1" />

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete?.(document.id);
                            }}
                            title="Delete knowledge component"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
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
