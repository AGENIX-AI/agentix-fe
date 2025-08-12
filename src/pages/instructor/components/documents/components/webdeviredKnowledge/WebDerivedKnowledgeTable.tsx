import type { Document } from "@/api/documents";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Edit, Trash2, Loader2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface WebDerivedKnowledgeTableProps {
  documents: Document[];
  getStatusColor: (status: string) => string;
  onRowClick: (documentId: string) => void;
  onEdit?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
  onView?: (document: Document) => void;
  loadingDocumentIds?: string[];
}

export function WebDerivedKnowledgeTable({
  documents,
  getStatusColor,
  onRowClick,
  onEdit,
  onDelete,
  onView,
  loadingDocumentIds = [],
}: WebDerivedKnowledgeTableProps) {
  const { t } = useTranslation();

  // Function to get a user-friendly status text
  const getStatusText = (status: string): string => {
    switch (status) {
      case "completed":
        return t("documents.webKnowledge.statusCompleted");
      case "not_complete":
        return t("documents.webKnowledge.statusInProgress");
      case "pending":
        return t("documents.webKnowledge.statusPending");
      case "failed":
        return t("documents.webKnowledge.statusFailed");
      case "crawl_completed":
        return t("documents.webKnowledge.statusCrawlCompleted");
      default:
        return (
          status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
        );
    }
  };

  return (
    <div className="relative w-full max-w-full">
      <div className="border rounded-md overflow-hidden">
        <div className="w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs ">
                  {t("documents.webKnowledge.tableTitle")}
                </TableHead>
                <TableHead className="text-xs">
                  {t("documents.webKnowledge.tableStatus")}
                </TableHead>
                <TableHead className="text-xs">
                  {t("documents.webKnowledge.tableCreated")}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {t("documents.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow
                  key={document.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onRowClick(document.id)}
                >
                  <TableCell className=" truncate">
                    <div className="text-xs font-medium">{document.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {document.url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full border",
                        getStatusColor(document.upload_status)
                      )}
                    >
                      {getStatusText(document.upload_status)}
                    </span>
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
                            title="View web derived knowledge"
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
                            title="Edit web derived knowledge"
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
                            title="Delete web derived knowledge"
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
