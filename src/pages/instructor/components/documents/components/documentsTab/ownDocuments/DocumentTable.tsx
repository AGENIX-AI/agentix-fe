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
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface DocumentTableProps {
  documents: Document[];
  getStatusColor: (status: string) => string;
  onRowClick?: (document: Document) => void;
  renderActions?: (document: Document) => ReactNode;
}

export function DocumentTable({
  documents,
  getStatusColor,
  onRowClick,
  renderActions,
}: DocumentTableProps) {
  const { t } = useTranslation();
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 text-xs">
            <TableHead
              className="text-left p-2 text-xs font-medium"
              style={{ width: "40%" }}
            >
              {t("documents.table.title")}
            </TableHead>

            <TableHead
              className="text-left p-2 text-xs font-medium"
              style={{ width: "20%" }}
            >
              {t("documents.table.status")}
            </TableHead>
            <TableHead
              className="text-left p-2 text-xs font-medium"
              style={{ width: "20%" }}
            >
              {t("documents.table.created")}
            </TableHead>
            <TableHead
              className="text-left p-2 text-xs font-medium"
              style={{ width: "20%" }}
            >
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
              <TableCell className="p-2 text-xs" style={{ width: "40%" }}>
                <div className="font-medium">{doc.title}</div>
                <div className="text-xs text-muted-foreground">
                  {doc.file_name}
                </div>
              </TableCell>

              <TableCell className="p-2 text-xs" style={{ width: "20%" }}>
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
              <TableCell className="p-2 text-xs" style={{ width: "20%" }}>
                {new Date(doc.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell
                className="p-2 text-xs flex items-center space-x-2"
                style={{ width: "20%" }}
              >
                {renderActions && renderActions(doc)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
