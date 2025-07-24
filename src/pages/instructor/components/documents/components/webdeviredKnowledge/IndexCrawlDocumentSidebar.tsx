import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { getCrawlDocuments, indexCrawlDocument } from "@/api/documents";

interface CrawlDocument {
  link: string;
  summary: string;
  markdown: string;
}

interface IndexCrawlDocumentSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documentId: string | null;
}

export function IndexCrawlDocumentSidebar({
  isVisible,
  onClose,
  onSuccess,
  documentId,
}: IndexCrawlDocumentSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [crawlDocuments, setCrawlDocuments] = useState<CrawlDocument[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});
  const [isParse, setIsParse] = useState(true);

  useEffect(() => {
    if (isVisible && documentId) {
      fetchCrawlDocuments();
    }
  }, [isVisible, documentId]);

  const fetchCrawlDocuments = async () => {
    if (!documentId) return;

    setIsLoading(true);
    try {
      const data = await getCrawlDocuments(documentId);
      setCrawlDocuments(data);

      // Initialize all documents as selected
      const initialSelectedDocs: Record<string, boolean> = {};
      data.forEach((doc: CrawlDocument) => {
        initialSelectedDocs[doc.link] = true;
      });
      setSelectedDocs(initialSelectedDocs);
    } catch (error) {
      console.error("Error fetching crawl documents:", error);
      toast.error("Failed to fetch crawl documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!documentId) return;

    setIsSubmitting(true);
    try {
      // Filter selected documents
      const selectedDocuments = crawlDocuments.filter(
        (doc) => selectedDocs[doc.link]
      );

      const response = await indexCrawlDocument(documentId, {
        is_parse: isParse,
        docs: selectedDocuments,
      });

      if (response.success) {
        toast.success(response.message || "Document indexed successfully");
        onSuccess();
      } else {
        toast.error(response.message || "Failed to index document");
      }
    } catch (error) {
      console.error("Error indexing crawl document:", error);
      toast.error("Failed to index crawl document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (link: string, checked: boolean) => {
    setSelectedDocs((prev) => ({
      ...prev,
      [link]: checked,
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelectedDocs: Record<string, boolean> = {};
    crawlDocuments.forEach((doc) => {
      newSelectedDocs[doc.link] = checked;
    });
    setSelectedDocs(newSelectedDocs);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-lg z-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Index Crawled Documents</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_parse"
                  checked={isParse}
                  onCheckedChange={(checked) => setIsParse(!!checked)}
                />
                <Label htmlFor="is_parse">Parse content</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select_all"
                  checked={
                    Object.values(selectedDocs).every(Boolean) &&
                    Object.keys(selectedDocs).length > 0
                  }
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
                <Label htmlFor="select_all">Select All</Label>
              </div>
            </div>

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {crawlDocuments.map((doc, index) => (
                  <div key={index} className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`doc-${index}`}
                          checked={selectedDocs[doc.link] || false}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(doc.link, !!checked)
                          }
                        />
                        <Label
                          htmlFor={`doc-${index}`}
                          className="font-medium text-sm truncate max-w-[250px]"
                        >
                          {doc.link}
                        </Label>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {doc.summary.substring(0, 150)}...
                    </div>
                  </div>
                ))}

                {crawlDocuments.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No crawled documents found
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={
                isSubmitting ||
                crawlDocuments.length === 0 ||
                Object.values(selectedDocs).every((v) => !v)
              }
            >
              {isSubmitting ? "Indexing..." : "Index Selected Documents"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
