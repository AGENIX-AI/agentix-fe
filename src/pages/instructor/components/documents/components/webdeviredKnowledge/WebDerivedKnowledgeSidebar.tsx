import { useState } from "react";
import { toast } from "sonner";
import { X, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createWebDerivedKnowledge } from "@/api/documents";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AddWebDerivedKnowledgeSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  metaData: any;
  setMetaData: (metaData: any) => void;
}

interface WebCrawlFormData {
  title: string;
  url: string;
  is_parse: boolean;
  depth: number;
  page_limit: number;
}

export function AddWebDerivedKnowledgeSidebar({
  isVisible,
  onClose,
  onSuccess,
  metaData,
  setMetaData,
}: AddWebDerivedKnowledgeSidebarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WebCrawlFormData>({
    title: "",
    url: "",
    is_parse: true,
    depth: 2,
    page_limit: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the API to create web derived knowledge
      const response = await createWebDerivedKnowledge(formData);

      if (response.success) {
        // Update metadata with the new document ID if needed
        setMetaData({
          ...metaData,
          currentWebDerivedKnowledgeId: response.document_id,
        });

        // Reset form
        setFormData({
          title: "",
          url: "",
          is_parse: true,
          depth: 2,
          page_limit: 3,
        });

        toast.success("Web derived knowledge creation started");
        // Call success callback
        onSuccess();
      } else {
        toast.error("Failed to create web derived knowledge");
      }
    } catch (error) {
      console.error("Error creating web derived knowledge:", error);
      toast.error("Failed to create web derived knowledge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_parse: checked }));
  };

  const handleNumberChange = (name: string, value: string) => {
    // Parse the input value as an integer
    let numValue = parseInt(value, 10);

    // Ensure the value is a number and within the range 1-100
    if (isNaN(numValue)) {
      numValue = 1;
    } else if (numValue < 1) {
      numValue = 1;
    } else if (numValue > 100) {
      numValue = 100;
    }

    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-background border-l border-border shadow-lg z-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add Web Derived Knowledge</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div className="space-y-3">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Google Web Derived Knowledge"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="e.g., https://www.google.com"
                required
              />
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
                        Crawl depth defines how many levels of links the crawler
                        will follow from the initial URL. A depth of 1 means
                        only the initial page, 2 includes all pages linked from
                        the initial page, and so on.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="depth"
                name="depth"
                type="number"
                min={1}
                max={100}
                value={formData.depth}
                onChange={(e) => handleNumberChange("depth", e.target.value)}
                className="mt-1"
                required
              />
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
              <Input
                id="page_limit"
                name="page_limit"
                type="number"
                min={1}
                max={100}
                value={formData.page_limit}
                onChange={(e) =>
                  handleNumberChange("page_limit", e.target.value)
                }
                className="mt-1"
                required
              />
            </div>
            <div className="flex items-center space-x-2 my-3">
              <Checkbox
                id="is_parse"
                checked={formData.is_parse}
                onCheckedChange={handleCheckboxChange}
                className="my-3"
              />
              <Label htmlFor="is_parse" className="my-3">
                Parse content
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Web Derived Knowledge"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
