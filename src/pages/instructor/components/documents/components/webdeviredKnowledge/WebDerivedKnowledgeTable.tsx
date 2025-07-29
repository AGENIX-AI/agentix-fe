import { Loader2, Eye, Database } from "lucide-react";
import type { Document } from "@/api/documents";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WebDerivedKnowledgeTableProps {
  documents: Document[];
  getStatusColor: (status: string) => string;
  onView: (documentId: string) => void;
  onIndex: (documentId: string) => void;
  onRowClick: (documentId: string) => void;
  loadingDocumentIds: string[];
  onLinkDocument: (documentId: string) => void;
  onUnlinkDocument: (documentId: string) => void;
}

export function WebDerivedKnowledgeTable({
  documents,
  getStatusColor,
  onView,
  onIndex,
  onRowClick,
  loadingDocumentIds,
  onLinkDocument,
  onUnlinkDocument,
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
                <TableHead className="text-xs ">{t("documents.webKnowledge.tableTitle")}</TableHead>
                <TableHead className="text-xs">{t("documents.webKnowledge.tableStatus")}</TableHead>
                <TableHead className="text-xs">{t("documents.webKnowledge.tableCreated")}</TableHead>
                <TableHead className="text-right text-xs">{t("documents.webKnowledge.tableActions")}</TableHead>
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
                    <div className="flex gap-2 justify-end">
                      {loadingDocumentIds.includes(document.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ) : (
                        <>
                          {document.linked ? (
                            <button
                              onClick={() => onUnlinkDocument?.(document.id)}
                              className="text-xs text-red-600 hover:underline"
                              disabled={loadingDocumentIds.includes(
                                document.id
                              )}
                            >
                              {t("documents.webKnowledge.actionUnlink")}
                            </button>
                          ) : (
                            <button
                              onClick={() => onLinkDocument?.(document.id)}
                              className="text-xs text-green-600 hover:underline"
                              disabled={loadingDocumentIds.includes(
                                document.id
                              )}
                            >
                              {t("documents.webKnowledge.actionLink")}
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(document.id);
                            }}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            title={t("documents.webKnowledge.tooltipView")}
                          >
                            <Eye className="h-3 w-3" />
                            {t("documents.webKnowledge.actionView")}
                          </button>
                          {/* <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(document.id);
                            }}
                            className="text-xs text-amber-600 hover:underline flex items-center gap-1"
                            title="Edit web derived knowledge"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(document.id);
                            }}
                            className="text-xs text-red-600 hover:underline flex items-center gap-1"
                            title="Delete web derived knowledge"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button> */}
                          {document.upload_status === "crawl_completed" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onIndex(document.id);
                              }}
                              className="text-xs text-green-600 hover:underline flex items-center gap-1"
                              title={t("documents.webKnowledge.tooltipIndex")}
                            >
                              <Database className="h-3 w-3" />
                              {t("documents.webKnowledge.actionIndex")}
                            </button>
                          )}
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
