import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Document {
  id: string;
  title: string;
  url: string;
  file_name: string;
  upload_status: "pending" | "completed" | "failed" | "not_complete";
  created_at: string;
  number_index?: number;
  type: "document" | "image";
  assistant_document?: { assistant_id: string }[];
}

interface DocumentTableProps {
  documents: Document[];
  getStatusColor: (status: string) => string;
}

export function DocumentTable({ documents, getStatusColor }: DocumentTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 text-xs">
            <TableHead className="text-left p-2 text-xs font-medium">
              Title
            </TableHead>
            <TableHead className="text-left p-2 text-xs font-medium">
              Type
            </TableHead>
            <TableHead className="text-left p-2 text-xs font-medium">
              Status
            </TableHead>
            <TableHead className="text-left p-2 text-xs font-medium">
              Created
            </TableHead>
            <TableHead className="text-left p-2 text-xs font-medium">
              Actions
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
              <TableCell className="p-2 text-xs">
                {doc.type}
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
              <TableCell className="p-2 text-xs">
                {new Date(doc.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="p-2 text-xs">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
