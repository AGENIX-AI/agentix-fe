import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getOwnDocuments } from "@/api/documents";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditWebDerivedKnowledgeSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  documentId: string | null;
}

interface WebCrawlFormData {
  title: string;
  url: string;
  is_parse: boolean;
  depth: number;
  page_limit: number;
}

export function EditWebDerivedKnowledgeSidebar({
  isVisible,
  onClose,
  onSuccess,
  documentId,
}: EditWebDerivedKnowledgeSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WebCrawlFormData>({
    title: "",
    url: "",
    is_parse: true,
    depth: 2,
    page_limit: 3,
  });

  useEffect(() => {
    if (isVisible && documentId) {
      fetchDocumentDetails();
    }
  }, [isVisible, documentId]);

  const fetchDocumentDetails = async () => {
    if (!documentId) return;

    setIsLoading(true);
    try {
      // In a real implementation, you would fetch the document details by ID
      // For now, we'll simulate it with the existing API
      const response = await getOwnDocuments({
        page_number: 1,
        page_size: 10,
      });

      if (response.success) {
        const document = response.documents.find(
          (doc) => doc.id === documentId
        );

        if (document) {
          // In a real implementation, you would have these fields available
          // For now, we'll set some default values based on the document
          setFormData({
            title: document.title || "",
            url: document.url || "",
            is_parse: true,
            depth: 2,
            page_limit: 3,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching document details:", error);
      toast.error("Failed to fetch document details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real implementation, you would call an API to update the document title
      // For now, we'll just simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Web derived knowledge title updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating web derived knowledge title:", error);
      toast.error("Failed to update web derived knowledge title");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, title: e.target.value }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-background border-l border-border shadow-lg z-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Web Derived Knowledge</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div className="space-y-3">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g., Google Web Derived Knowledge"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="url">URL</Label>
                <div className="text-sm text-muted-foreground border border-border rounded-md px-3 py-2 bg-muted/20">
                  {formData.url}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-1">
                  <Label htmlFor="depth">Crawl Depth</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          Crawl depth defines how many levels of links the
                          crawler will follow from the initial URL. A depth of 1
                          means only the initial page, 2 includes all pages
                          linked from the initial page, and so on.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-sm text-muted-foreground border border-border rounded-md px-3 py-2 bg-muted/20">
                  {formData.depth}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-1">
                  <Label htmlFor="page_limit">Page Limit</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          Page limit controls the maximum number of pages that
                          will be crawled. This prevents the crawler from
                          downloading too many pages from a large website.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-sm text-muted-foreground border border-border rounded-md px-3 py-2 bg-muted/20">
                  {formData.page_limit}
                </div>
              </div>

              <div className="flex items-center space-x-2 my-3">
                <Checkbox
                  id="is_parse"
                  checked={formData.is_parse}
                  disabled={true}
                  className="my-3 opacity-60"
                />
                <Label
                  htmlFor="is_parse"
                  className="my-3 text-muted-foreground"
                >
                  Parse content
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Title"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
