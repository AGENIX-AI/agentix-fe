import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  getCollectionChildrenDocuments,
  type Document,
  type GetDocumentsParams,
} from "@/api/documents";

interface UseCollectionDocumentsResult {
  documents: Document[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  refetch: () => Promise<void>;
}

export function useCollectionDocuments(
  collectionId: string,
  childrenType: GetDocumentsParams["type"],
  pageSize = 10,
  sortBy: string = "created_at",
  sortOrder: number = 1
): UseCollectionDocumentsResult {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDocuments = useCallback(async () => {
    if (!collectionId) return;
    setIsLoading(true);
    try {
      const response = await getCollectionChildrenDocuments(collectionId, {
        page_number: currentPage,
        page_size: pageSize,
        search: searchQuery,
        sort_by: sortBy,
        sort_order: sortOrder,
        type: childrenType,
      });

      if (response.success) {
        setDocuments(response.documents);
        setTotalItems(response.total_items);
      } else {
        throw new Error("Failed to fetch collection documents");
      }
    } catch (error) {
      console.error("Error fetching collection documents:", error);
      toast.error("Failed to fetch collection documents");
    } finally {
      setIsLoading(false);
    }
  }, [
    childrenType,
    collectionId,
    currentPage,
    pageSize,
    searchQuery,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    isLoading,
    totalItems,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    refetch: fetchDocuments,
  };
}
