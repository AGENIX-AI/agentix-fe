import { useState, useEffect } from "react";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import {
  getOwnDocuments,
  createTopicKnowledge,
  type Framework,
  type Document,
} from "@/api/documents";
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
  setMetaData: (metaData: any) => void;
  metaData: any;
}

const frameworkDescriptions: Record<Framework, string> = {
  FWOH: "5W1H framework analyzes Who, What, When, Where, Why, and How aspects of information to provide comprehensive understanding.",
  PESTEL:
    "PESTEL framework examines Political, Economic, Social, Technological, Environmental, and Legal factors affecting a situation.",
  SWOT: "SWOT framework analyzes Strengths, Weaknesses, Opportunities, and Threats to evaluate strategic positioning.",
  BLOOMTAXONOMY:
    "Bloom's Taxonomy framework categorizes learning objectives across cognitive levels from basic knowledge to advanced evaluation.",
};

const frameworkLabels: Record<Framework, string> = {
  FWOH: "5W1H",
  PESTEL: "PESTEL",
  SWOT: "SWOT",
  BLOOMTAXONOMY: "Bloom's Taxonomy",
};

export function AddTopicKnowledgeSidebar({
  isVisible,
  onClose,
  onSuccess,
  setMetaData,
  metaData,
}: AddTopicKnowledgeSidebarProps) {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState<string>("");
  const [framework, setFramework] = useState<Framework>("FWOH");
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
      // Create knowledge component with framework
      const createResponse = await createTopicKnowledge({
        base_documents: selectedDocuments,
        title: title.trim(),
        language,
        framework,
      });

      if (createResponse.document_id) {
        toast.success("Knowledge component created successfully!");
        setMetaData({
          ...metaData,
          currentTopicKnowledgeId: createResponse.document_id,
        });
        handleClose();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error creating knowledge component:", error);
      toast.error("Failed to create knowledge component");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setTitle("");
    setLanguage("");
    setFramework("FWOH");
    setSelectedDocuments([]);
    setDocuments([]);
    onClose();
  };

  const isSubmitDisabled = () => {
    if (isSubmitting) return true;
    if (!title.trim() || !language || selectedDocuments.length === 0)
      return true;
    return false;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={handleClose} />

      {/* Sidebar */}
      <div className="relative ml-auto w-[500px] bg-background border-l shadow-xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b h-18">
          <h2 className="text-lg font-semibold">Add Knowledge Component</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-xs"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter knowledge component title"
              disabled={isSubmitting}
            />
          </div>

          {/* Language Selection */}
          <div className="space-y-2">
            <Label className="text-xs">Language</Label>
            <Select
              value={language}
              onValueChange={setLanguage}
              disabled={isSubmitting}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English" className="text-xs">
                  English
                </SelectItem>
                <SelectItem value="Vietnamese" className="text-xs">
                  Vietnamese
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Framework Selection */}
          {/* <div className="space-y-2">
            <Label className="text-xs">Analytical Framework</Label>
            <Select
              value={framework}
              onValueChange={(value: Framework) => setFramework(value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FWOH" className="text-xs">
                  5W1H
                </SelectItem>
                <SelectItem value="PESTEL" className="text-xs">
                  PESTEL
                </SelectItem>
                <SelectItem value="SWOT" className="text-xs">
                  SWOT
                </SelectItem>
                <SelectItem value="BLOOMTAXONOMY" className="text-xs">
                  Bloom's Taxonomy
                </SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Framework Description */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <Small className="text-muted-foreground">
              <strong>{frameworkLabels[framework]} Framework:</strong>
              <br />
              {frameworkDescriptions[framework]}
            </Small>
          </div>

          {/* Document Selection */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-xs">Base Documents</Label>
              {documents.length > 0 && (
                <Button
                  variant="ghost"
                  size="default"
                  onClick={handleSelectAll}
                  disabled={isSubmitting}
                  className="text-xs"
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
                    className="flex items-start space-x-6 p-2 rounded-md cursor-pointer"
                  >
                    <Checkbox
                      id={`doc-${document.id}`}
                      checked={selectedDocuments.includes(document.id)}
                      onCheckedChange={(checked) =>
                        handleDocumentSelect(document.id, checked as boolean)
                      }
                      disabled={isSubmitting}
                      className="text-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={`doc-${document.id}`}
                        className="text-xs font-medium cursor-pointer"
                      >
                        {document.title}
                      </Label>
                      <div className="text-xs text-muted-foreground">
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
        <div className="border-t h-16 px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled()}
            className="flex-1 ml-6 text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
                Creating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2 text-primary" />
                Create {frameworkLabels[framework]} Knowledge Component
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
