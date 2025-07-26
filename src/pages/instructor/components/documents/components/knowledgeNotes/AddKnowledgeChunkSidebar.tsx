import { useState } from "react";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import {
  createTopicKnowledgeManual,
  createTopicKnowledgeFramework,
  type Framework,
} from "@/api/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Small } from "@/components/ui/typography";
import { Checkbox } from "@/components/ui/checkbox";

interface AddKnowledgeChunkSidebarProps {
  isVisible: boolean;
  topicKnowledgeId: string;
  onClose: () => void;
  onSuccess?: () => void;
  onCreateManualNote?: (data: {
    title: string;
    content: string;
    ai_parse?: boolean;
  }) => Promise<boolean>;
  onCreateFrameworkNotes?: (framework: Framework) => Promise<boolean>;
}

type Mode = "Manual" | "Framework";

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

export function AddKnowledgeChunkSidebar({
  isVisible,
  topicKnowledgeId,
  onClose,
  onSuccess,
  onCreateManualNote,
  onCreateFrameworkNotes,
}: AddKnowledgeChunkSidebarProps) {
  const [mode, setMode] = useState<Mode>("Manual");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [aiParse, setAiParse] = useState(false);
  const [framework, setFramework] = useState<Framework>("FWOH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (mode === "Manual") {
      if (!title.trim()) {
        toast.error("Please enter a title");
        return;
      }
      if (!content.trim()) {
        toast.error("Please enter content");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let success = false;

      if (mode === "Manual") {
        if (onCreateManualNote) {
          // Use the custom callback if provided
          success = await onCreateManualNote({
            title: title.trim(),
            content: content.trim(),
            ai_parse: aiParse,
          });
        } else {
          // Fall back to default implementation
          const response = await createTopicKnowledgeManual({
            document_id: topicKnowledgeId,
            title: title.trim(),
            content: content.trim(),
            ai_parse: aiParse,
          });

          if (response.success) {
            toast.success("Note created successfully!");
            success = true;
          }
        }
      } else {
        if (onCreateFrameworkNotes) {
          // Use the custom callback if provided
          success = await onCreateFrameworkNotes(framework);
        } else {
          // Fall back to default implementation
          const response = await createTopicKnowledgeFramework({
            document_id: topicKnowledgeId,
            framework,
          });

          if (response.success) {
            toast.success(
              `${response.output.length} notes created using ${frameworkLabels[framework]} framework!`
            );
            success = true;
          }
        }
      }

      if (success) {
        handleClose();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setMode("Manual");
    setTitle("");
    setContent("");
    setAiParse(false);
    setFramework("FWOH");
    onClose();
  };

  const isSubmitDisabled = () => {
    if (isSubmitting) return true;
    if (mode === "Manual") {
      return !title.trim() || !content.trim();
    }
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
          <h2 className="text-lg font-semibold">Add Notes</h2>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Mode Selection */}
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select
              value={mode}
              onValueChange={(value: Mode) => setMode(value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manual">Manual</SelectItem>
                <SelectItem value="Framework">Framework</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Manual Mode */}
          {mode === "Manual" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter knowledge chunk title"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter knowledge chunk content"
                  rows={6}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="aiParse"
                  checked={aiParse}
                  onCheckedChange={(checked) => setAiParse(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="aiParse" className="text-sm cursor-pointer">
                  AI Parse
                </Label>
              </div>
            </>
          )}

          {/* Framework Mode */}
          {mode === "Framework" && (
            <>
              <div className="space-y-2">
                <Label>Analytical Framework</Label>
                <Select
                  value={framework}
                  onValueChange={(value: Framework) => setFramework(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FWOH">5W1H</SelectItem>
                    <SelectItem value="PESTEL">PESTEL</SelectItem>
                    <SelectItem value="SWOT">SWOT</SelectItem>
                    <SelectItem value="BLOOMTAXONOMY">
                      Bloom's Taxonomy
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Framework Description */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <Small className="text-muted-foreground">
                  <strong>{frameworkLabels[framework]} Framework:</strong>
                  <br />
                  {frameworkDescriptions[framework]}
                </Small>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t h-16 px-6 py-4 flex items-center justify-between">
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
              disabled={isSubmitDisabled()}
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
                  Create {mode === "Framework" ? "Framework " : ""}Notes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
