import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

import {
  getAssistantDocuments,
  type Document as ApiDocument,
} from "@/api/documents";
import { useInstructor } from "@/contexts/InstructorContext";
import { Large, Small } from "@/components/ui/typography";

import { SearchFilterBar } from "./shared/SearchFilterBar";
import { DocumentTable } from "./shared/DocumentTable";
import { Pagination } from "./shared/Pagination";
import { EmbeddedDocumentsComponent } from "./ownDocuments";
import type { DocumentType } from "./types";
import { Separator } from "@/components/ui/separator";

// Define the document interface specific to this component
export interface AssistantDocument {
  id: string;
  title: string;
  type: string;
  upload_status: string;
  created_at: string;
  view_link: string;
  assistant_document?: { assistant_id: string }[];
}

export default function ModifyDocumentComponent() {
  const { assistantId, assistantInfo } = useInstructor();
  const [documents, setDocuments] = useState<AssistantDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [documentType, setDocumentType] = useState<DocumentType>("all");

  // Function to fetch assistant documents that can be called from child components
  const fetchAssistantDocuments = async () => {
    if (!assistantId) return;

    setIsLoading(true);
    try {
      const response = await getAssistantDocuments(assistantId, {
        page_number: currentPage,
        page_size: pageSize,
        search: searchQuery || undefined,
        type: documentType === "all" ? undefined : documentType,
      });

      if (response.success) {
        // Convert API documents to our AssistantDocument interface
        const mappedDocuments = response.documents.map((doc: ApiDocument) => ({
          id: doc.id,
          title: doc.title || doc.file_name || "",
          view_link: doc.url || "",
          upload_status: doc.upload_status,
          created_at: doc.created_at,
          type: doc.type,
          assistant_document: doc.assistant_document,
        }));

        setDocuments(mappedDocuments);
        setTotalItems(response.total_items);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch documents when assistantId, page, search, or document type changes
  useEffect(() => {
    fetchAssistantDocuments();
  }, [assistantId, currentPage, pageSize, searchQuery, documentType]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-100 dark:bg-green-950/30 dark:border-green-900";
      case "pending":
      case "not_complete":
        return "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900";
      case "failed":
        return "text-red-600 bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100 dark:bg-gray-900/30 dark:border-gray-800";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-20 bg-background flex items-center h-18 border-b w-full p-6">
        <Large className="font-bold tracking-tight">Modify Document</Large>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 px-6 pt-3">
        <Small className=" font-semibold mb-2">
          {assistantInfo?.name} Documents
        </Small>
        <SearchFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          documentType={documentType}
          setDocumentType={setDocumentType}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {documents.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <h3 className="mt-2 text-xs font-medium">No documents found</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  No documents available
                </p>
              </div>
            ) : (
              <div>
                <DocumentTable
                  documents={documents}
                  getStatusColor={getStatusColor}
                />

                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  documentsCount={documents.length}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
        <Separator orientation="horizontal" />
        <EmbeddedDocumentsComponent
          refreshAssistantDocuments={fetchAssistantDocuments}
        />
      </div>
    </div>
  );
}
