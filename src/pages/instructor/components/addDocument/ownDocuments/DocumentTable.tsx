import { cn } from "@/lib/utils";
import type { Document } from "@/api/documents";
import { useTranslation } from "react-i18next";
import { Loader2, Edit, Trash2, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DocumentTableProps {
  documents: Document[];
  getStatusColor: (status: string) => string;
  getLinkStatus: (linked: boolean | undefined) => string;
  onEdit?: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
  loadingDocumentIds?: string[];
}

export function DocumentTable({
  documents,
  getStatusColor,
  getLinkStatus,
  onEdit,
  onDelete,
  loadingDocumentIds = [],
}: DocumentTableProps) {
  const { t } = useTranslation();
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 text-xs">
            <TableHead className="text-left p-2 text-xs font-medium">
              {t("document.table.title")}
            </TableHead>
            <TableHead className="text-left p-2 text-xs font-medium">
              {t("document.table.type")}
            </TableHead>
            <TableHead className="text-left p-2 text-xs font-medium">
              {t("document.table.status")}
            </TableHead>
            <TableHead className="text-left p-2 text-xs font-medium">
              {t("document.table.linked")}
            </TableHead>
            <TableHead className="text-left p-2 text-xs font-medium">
              {t("document.table.created")}
            </TableHead>
            <TableHead className="text-left p-2 text-xs font-medium">
              {t("document.table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="p-2 text-xs">
                <div className="font-medium">{doc.title}</div>
                <div className="text-xs text-muted-foreground">
                  {doc.file_name}
                </div>
              </TableCell>
              <TableCell className="p-2 text-xs">{doc.type}</TableCell>
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
              <TableCell className="p-2 text-xs">
                <span
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium border",
                    getLinkStatus(doc.linked)
                  )}
                >
                  {doc.linked
                    ? t("document.table.linked_status.linked")
                    : t("document.table.linked_status.not_linked")}
                </span>
              </TableCell>
              <TableCell className="p-2 text-xs">
                {new Date(doc.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="p-2 text-xs">
                <div className="flex gap-2 justify-start">
                  {loadingDocumentIds.includes(doc.id) ? (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  ) : (
                    <>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs inline-flex items-center gap-1 text-blue-600 hover:underline"
                        title={t("document.table.view")}
                      >
                        <ExternalLink className="h-3 w-3" />
                        {t("document.table.view")}
                      </a>
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(doc.id);
                          }}
                          className="text-xs text-amber-600 hover:underline flex items-center gap-1"
                          title="Edit document"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(doc.id);
                          }}
                          className="text-xs text-red-600 hover:underline flex items-center gap-1"
                          title="Delete document"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
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
  );
}
