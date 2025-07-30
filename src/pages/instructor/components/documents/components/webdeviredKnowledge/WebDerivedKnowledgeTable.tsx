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
  onRowClick: (documentId: string) => void;
}

export function WebDerivedKnowledgeTable({
  documents,
  getStatusColor,
  onRowClick,
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
