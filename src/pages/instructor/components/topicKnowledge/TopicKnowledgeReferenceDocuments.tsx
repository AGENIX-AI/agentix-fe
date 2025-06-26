import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getTopicKnowledgeReferenceDocuments } from "@/api/documents";
import type { Document } from "@/api/documents";

import { DocumentTable } from "../modifyDocument/shared/DocumentTable";
import { Small } from "@/components/ui/typography";

interface TopicKnowledgeReferenceDocumentsProps {
  topicKnowledgeId: string;
}

export function TopicKnowledgeReferenceDocuments({
  topicKnowledgeId,
}: TopicKnowledgeReferenceDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch reference documents when topicKnowledgeId changes
  useEffect(() => {
    const fetchReferenceDocuments = async () => {
      if (!topicKnowledgeId) return;

      setIsLoading(true);
      try {
        const response = await getTopicKnowledgeReferenceDocuments(
          topicKnowledgeId
        );

        if (response.success) {
          setDocuments(response.documents);
        }
      } catch (error) {
        console.error("Error fetching reference documents:", error);
        toast.error("Failed to fetch reference documents");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferenceDocuments();
  }, [topicKnowledgeId]);

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
    <div className="my-3">
      <div className="mb-3">
        <Small className="font-semibold">Reference Documents</Small>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {documents.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <h3 className="mt-2 text-xs font-medium">
                No reference documents found
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                No reference documents available for this knowledge component
              </p>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-hidden">
              <div className="w-full max-w-full overflow-x-auto">
                <DocumentTable
                  documents={documents}
                  getStatusColor={getStatusColor}
                  showLinkedColumn={false}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
