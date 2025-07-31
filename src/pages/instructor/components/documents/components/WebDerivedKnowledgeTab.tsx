import { useState, useEffect } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { getOwnDocuments } from "@/api/documents";
import type { Document } from "@/api/documents";
import { useInstructor } from "@/contexts/InstructorContext";

import { Pagination } from "@/pages/instructor/components/modifyDocument/shared/Pagination";
import { Small } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { AddWebDerivedKnowledgeSidebar } from "./webdeviredKnowledge/WebDerivedKnowledgeSidebar";
import { WebDerivedKnowledgeTable } from "./webdeviredKnowledge/WebDerivedKnowledgeTable";

import WebDerivedKnowledgeDetailsView from "./webdeviredKnowledge/WebDerivedKnowledgeDetailsView";
import { Input } from "@/components/ui/input";
import { t } from "i18next";

export default function WebDerivedKnowledgeTab() {
  const { metaData, setMetaData, assistantId } = useInstructor();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [showAddSidebar, setShowAddSidebar] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [showDetailsView, setShowDetailsView] = useState(false);

  // Fetch documents when page, search, or refresh trigger changes
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const response = await getOwnDocuments({
          page_number: currentPage,
          page_size: pageSize,
          search: searchQuery || "",
          type: "crawl_document", // Using a supported type
          sort_by: "created_at",
          sort_order: 1,
          assistant_id: assistantId || "",
        });

        if (response.success) {
          setDocuments(response.documents);
          setTotalItems(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching web derived knowledge:", error);
        toast.error("Failed to fetch web derived knowledge");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [currentPage, pageSize, searchQuery, refreshDocuments, assistantId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "crawl_completed":
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

  const handleRowClick = (documentId: string) => {
    try {
      // Find the document by ID
      const document = documents.find((doc) => doc.id === documentId);
      if (document) {
        setSelectedDocument(document);
        setShowDetailsView(true);
        setMetaData?.({
          ...metaData,
          currentWebDerivedKnowledgeId: documentId,
        });
      }
    } catch (error) {
      console.error("Error selecting online sources:", error);
      toast.error("Failed to select online sources");
    }
  };

  const handleBackFromDetails = () => {
    setShowDetailsView(false);
    setSelectedDocument(null);
  };

  const handleAddSidebarSuccess = () => {
    // Refresh the documents list
    setRefreshDocuments((prev) => prev + 1);
    // Close the sidebar
    setShowAddSidebar(false);
  };

  // Show details view if selected
  if (showDetailsView && selectedDocument) {
    return (
      <WebDerivedKnowledgeDetailsView
        document={selectedDocument}
        onBack={handleBackFromDetails}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="">
          <div className="mb-3 flex items-center justify-between">
            <Small className="font-semibold">Online Sources</Small>
            <Button
              onClick={() => setShowAddSidebar(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Online Sources
            </Button>
          </div>

          {/* Search bar */}
          <div className="mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <Input
                placeholder={t("documents.webKnowledge.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-border rounded-md text-xs"
              />
            </div>
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
                    No online sources found
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add online sources by clicking the button above
                  </p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="w-full">
                    <WebDerivedKnowledgeTable
                      documents={documents}
                      getStatusColor={getStatusColor}
                      onRowClick={handleRowClick}
                    />
                  </div>

                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={totalItems}
                      pageSize={pageSize}
                      documentsCount={documents.length}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AddWebDerivedKnowledgeSidebar
        isVisible={showAddSidebar}
        onClose={() => setShowAddSidebar(false)}
        onSuccess={handleAddSidebarSuccess}
        metaData={metaData}
        setMetaData={setMetaData}
      />

      {/* <EditWebDerivedKnowledgeSidebar
        isVisible={showEditSidebar}
        onClose={() => setShowEditSidebar(false)}
        onSuccess={handleEditSidebarSuccess}
        documentId={selectedDocumentId}
      />

      <IndexCrawlDocumentSidebar
        isVisible={showIndexSidebar}
        onClose={() => setShowIndexSidebar(false)}
        onSuccess={handleIndexSidebarSuccess}
        documentId={selectedDocumentId}
      /> */}
    </div>
  );
}
