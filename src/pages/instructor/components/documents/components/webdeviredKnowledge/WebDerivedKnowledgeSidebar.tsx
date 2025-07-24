import { useState } from "react";
import { toast } from "sonner";
import { X, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWebDerivedKnowledge } from "@/api/documents";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    is_parse: true, // Always true now
    depth: 0,
    page_limit: 1,
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
          depth: 0,
          page_limit: 1,
        });

        toast.success("Online sources creation started");
        // Call success callback
        onSuccess();
      } else {
        toast.error("Failed to create online sources");
      }
    } catch (error) {
      console.error("Error creating online sources:", error);
      toast.error("Failed to create online sources");
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

  const handleDepthChange = (value: string) => {
    setFormData((prev) => ({ ...prev, depth: parseInt(value) }));
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
    <div className="fixed inset-y-0 right-0 w-80 bg-background border-l border-border shadow-lg z-50 overflow-hidden flex flex-col h-screen">
      {/* Header - fixed height h-18 */}
      <div className="flex items-center justify-between h-18 border-b border-border px-6">
        <h2 className="text-lg font-semibold">Add Online Sources</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content - takes remaining space between header and footer */}
      <div className="flex-grow overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full px-6 py-4"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Google Online Sources"
                required
              />
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <Label>Crawl Depth</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Choose whether to crawl only the current page (0) or
                        follow links up to 3 levels deep.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <RadioGroup
                value={formData.depth.toString()}
                onValueChange={handleDepthChange}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="depth-0" />
                  <Label htmlFor="depth-0">Current Page</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="depth-3" />
                  <Label htmlFor="depth-3">Deep Crawl</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
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
                required
              />
            </div>
          </div>
        </form>
      </div>

      {/* Footer - fixed height h-18 */}
      <div className="h-18 border-t border-border px-6 flex items-center">
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Adding..." : "Add Online Sources"}
        </Button>
      </div>
    </div>
  );
}
