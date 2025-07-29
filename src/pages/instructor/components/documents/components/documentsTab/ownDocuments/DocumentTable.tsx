import { cn } from "@/lib/utils";
import type { Document } from "@/api/documents";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Link, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface DocumentTableProps {
  documents: Document[];
  getStatusColor: (status: string) => string;
  getLinkStatus: (linked: boolean | undefined) => string;
  showLinkedColumn?: boolean;
  onLinkDocument?: (documentId: string) => void;
  onUnlinkDocument?: (documentId: string) => void;
  loadingDocumentIds?: string[];
  onViewDocument?: (documentId: string) => void;
  onRowClick?: (document: Document) => void;
  renderActions?: (document: Document) => ReactNode;
}

export function DocumentTable({
  documents,
  getStatusColor,
  getLinkStatus,
  showLinkedColumn = false,
  onLinkDocument,
  onUnlinkDocument,
  loadingDocumentIds = [],
  onViewDocument,
  onRowClick,
  renderActions,
}: DocumentTableProps) {
  const { t } = useTranslation();
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 text-xs">
            <TableHead className="text-left p-2 text-xs font-medium">
              {t("documents.table.title")}
            </TableHead>

            <TableHead className="text-left p-2 text-xs font-medium">
              {t("documents.table.status")}
            </TableHead>
            {showLinkedColumn && (
              <TableHead className="text-left p-2 text-xs font-medium">
                {t("documents.table.linked")}
              </TableHead>
            )}
            <TableHead className="text-left p-2 text-xs font-medium">
              {t("documents.table.created")}
            </TableHead>
            <TableHead className="text-left p-2 text-xs font-medium">
              {t("documents.table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow
              key={doc.id}
              className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
              onClick={() => onRowClick && onRowClick(doc)}
            >
              <TableCell className="p-2 text-xs">
                <div className="font-medium">{doc.title}</div>
                <div className="text-xs text-muted-foreground">
                  {doc.file_name}
                </div>
              </TableCell>

              <TableCell className="p-2 text-xs">
                <span
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium border",
                    getStatusColor(doc.upload_status)
                  )}
                >
                  {doc.upload_status.charAt(0).toUpperCase() +
                    doc.upload_status.slice(1).replace("_", " ")}
                </span>
              </TableCell>
              {showLinkedColumn && (
                <TableCell className="p-2 text-xs">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium border",
                      getLinkStatus(doc.linked)
                    )}
                  >
                    {doc.linked ? t("documents.table.linked_status.linked") : t("documents.table.linked_status.not_linked")}
                  </span>
                </TableCell>
              )}
              <TableCell className="p-2 text-xs">
                {new Date(doc.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="p-2 text-xs flex items-center space-x-2">
                {onViewDocument && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDocument(doc.id);
                    }}
                    className="text-xs inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {t("documents.table.view")}
                  </button>
                )}
                {!onViewDocument && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs inline-flex items-center gap-1 text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t("documents.table.view")}
                  </a>
                )}

                {showLinkedColumn && (
                  <>
                    {doc.linked
                      ? onUnlinkDocument && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnlinkDocument(doc.id);
                            }}
                            disabled={loadingDocumentIds.includes(doc.id)}
                          >
                            {loadingDocumentIds.includes(doc.id) ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Unlink className="h-3 w-3" />
                            )}
                          </Button>
                        )
                      : onLinkDocument && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              onLinkDocument(doc.id);
                            }}
                            disabled={loadingDocumentIds.includes(doc.id)}
                          >
                            {loadingDocumentIds.includes(doc.id) ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Link className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                  </>
                )}

                {renderActions && renderActions(doc)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
