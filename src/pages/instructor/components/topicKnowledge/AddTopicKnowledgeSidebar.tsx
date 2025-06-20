import { useState, useEffect } from "react";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import { getOwnDocuments, createTopicKnowledge } from "@/api/documents";
import type { Document } from "@/api/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Small } from "@/components/ui/typography";

interface AddTopicKnowledgeSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddTopicKnowledgeSidebar({
  isVisible,
  onClose,
  onSuccess,
}: AddTopicKnowledgeSidebarProps) {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<string>("");
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch documents when sidebar becomes visible
  useEffect(() => {
    if (isVisible) {
      fetchDocuments();
    }
  }, [isVisible]);

  const fetchDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const response = await getOwnDocuments({
        page_number: 1,
        page_size: 100, // Get more documents to choose from
        type: "document", // Only fetch document type, not images or topic_knowledge
        sort_by: "created_at",
        sort_order: 1,
      });

      if (response.success) {
        setDocuments(response.documents);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to fetch documents");
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleDocumentSelect = (documentId: string, checked: boolean) => {
    setSelectedDocuments((prev) => {
      if (checked) {
        return [...prev, documentId];
      } else {
        return prev.filter((id) => id !== documentId);
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map((doc) => doc.id));
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!language) {
      toast.error("Please select a language");
      return;
    }

    if (selectedDocuments.length === 0) {
      toast.error("Please select at least one document");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createTopicKnowledge({
        base_documents: selectedDocuments,
        title: title.trim(),
        language,
      });

      if (response.success) {
        toast.success("Topic knowledge created successfully!");
        handleClose();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error creating topic knowledge:", error);
      toast.error("Failed to create topic knowledge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setTitle("");
    setLanguage("");
    setSelectedDocuments([]);
    setDocuments([]);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={handleClose} />

      {/* Sidebar */}
      <div className="relative ml-auto w-[500px] bg-background border-l shadow-xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Add Topic Knowledge</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter topic knowledge title"
              disabled={isSubmitting}
            />
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={language}
              onValueChange={setLanguage}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Vietnamese">Vietnamese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Base Documents</Label>
              {documents.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isSubmitting}
                >
                  {selectedDocuments.length === documents.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              )}
            </div>

            {isLoadingDocuments ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 border rounded-lg border-dashed">
                <Small className="text-muted-foreground">
                  No documents available
                </Small>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-3">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50"
                  >
                    <Checkbox
                      id={`doc-${document.id}`}
                      checked={selectedDocuments.includes(document.id)}
                      onCheckedChange={(checked) =>
                        handleDocumentSelect(document.id, checked as boolean)
                      }
                      disabled={isSubmitting}
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={`doc-${document.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {document.title}
                      </Label>
                      <div className="text-xs text-muted-foreground mt-1">
                        {document.file_name} • {document.type} •{" "}
                        {new Date(document.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedDocuments.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedDocuments.length} document(s) selected
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !title.trim() ||
                !language ||
                selectedDocuments.length === 0
              }
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Topic Knowledge
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
