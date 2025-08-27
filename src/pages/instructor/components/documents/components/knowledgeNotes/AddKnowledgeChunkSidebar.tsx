import { useState, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Small } from "@/components/ui/typography";
import { Checkbox } from "@/components/ui/checkbox";
import { TiptapContentBlocksEditor } from "@/components/editor/TiptapContentBlocksEditor";
import type { ContentBlock } from "@/api/admin/helpCenter";

// Constants
const FRAMEWORK_DESCRIPTIONS: Record<Framework, string> = {
  FWOH: "5W1H framework analyzes Who, What, When, Where, Why, and How aspects of information to provide comprehensive understanding.",
  PESTEL:
    "PESTEL framework examines Political, Economic, Social, Technological, Environmental, and Legal factors affecting a situation.",
  SWOT: "SWOT framework analyzes Strengths, Weaknesses, Opportunities, and Threats to evaluate strategic positioning.",
  BLOOMTAXONOMY:
    "Bloom's Taxonomy framework categorizes learning objectives across cognitive levels from basic knowledge to advanced evaluation.",
};

const FRAMEWORK_LABELS: Record<Framework, string> = {
  FWOH: "5W1H",
  PESTEL: "PESTEL",
  SWOT: "SWOT",
  BLOOMTAXONOMY: "Bloom's Taxonomy",
};

// Types
type Mode = "Manual" | "Framework";

interface ManualNoteData {
  title: string;
  content: ContentBlock[];
  ai_parse?: boolean;
}

interface AddKnowledgeChunkSidebarProps {
  isVisible: boolean;
  topicKnowledgeId: string;
  onClose: () => void;
  onSuccess?: () => void;
  onCreateManualNote?: (data: ManualNoteData) => Promise<boolean>;
  onCreateFrameworkNotes?: (framework: Framework) => Promise<boolean>;
}

// Custom hook for form state management
const useFormState = () => {
  const [mode, setMode] = useState<Mode>("Manual");
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [aiParse, setAiParse] = useState(false);
  const [framework, setFramework] = useState<Framework>("FWOH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setMode("Manual");
    setTitle("");
    setBlocks([]);
    setAiParse(false);
    setFramework("FWOH");
  }, []);

  const isSubmitDisabled = useCallback(() => {
    if (isSubmitting) return true;
    if (mode === "Manual") {
      return !title.trim() || blocks.length === 0;
    }
    return false;
  }, [isSubmitting, mode, title, blocks]);

  return {
    mode,
    setMode,
    title,
    setTitle,
    blocks,
    setBlocks,
    aiParse,
    setAiParse,
    framework,
    setFramework,
    isSubmitting,
    setIsSubmitting,
    resetForm,
    isSubmitDisabled,
  };
};

export function AddKnowledgeChunkSidebar({
  isVisible,
  topicKnowledgeId,
  onClose,
  onSuccess,
  onCreateManualNote,
  onCreateFrameworkNotes,
}: AddKnowledgeChunkSidebarProps) {
  const {
    mode,
    setMode,
    title,
    setTitle,
    blocks,
    setBlocks,
    aiParse,
    setAiParse,
    framework,
    setFramework,
    isSubmitting,
    setIsSubmitting,
    resetForm,
    isSubmitDisabled,
  } = useFormState();

  const handleSubmit = useCallback(async () => {
    if (mode === "Manual") {
      if (!title.trim()) {
        toast.error("Please enter a title");
        return;
      }
      if (blocks.length === 0) {
        toast.error("Please add some content blocks");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let success = false;

      if (mode === "Manual") {
        if (onCreateManualNote) {
          success = await onCreateManualNote({
            title: title.trim(),
            content: blocks,
            ai_parse: aiParse,
          });
        } else {
          const response = await createTopicKnowledgeManual({
            page_id: topicKnowledgeId,
            title: title.trim(),
            content: blocks,
            ai_parse: aiParse,
          });

          if (response.success) {
            toast.success("Note created successfully!");
            success = true;
          }
        }
      } else {
        if (onCreateFrameworkNotes) {
          success = await onCreateFrameworkNotes(framework);
        } else {
          const response = await createTopicKnowledgeFramework({
            page_id: topicKnowledgeId,
            framework,
          });

          if (response.success) {
            toast.success(
              `${response.output.length} notes created using ${FRAMEWORK_LABELS[framework]} framework!`
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
  }, [
    mode,
    title,
    blocks,
    aiParse,
    framework,
    topicKnowledgeId,
    onCreateManualNote,
    onCreateFrameworkNotes,
    onSuccess,
  ]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Render mode selection
  const renderModeSelection = () => (
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
  );

  // Render manual mode form
  const renderManualMode = () => (
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
        <Label>Content</Label>
        <TiptapContentBlocksEditor
          blocks={blocks}
          previousBlocks={[]}
          onChange={(updated) => setBlocks(updated)}
          placeholder="Type '/' for commands..."
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
  );

  // Render framework mode form
  const renderFrameworkMode = () => (
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
            <SelectItem value="BLOOMTAXONOMY">Bloom's Taxonomy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
        <Small className="text-muted-foreground">
          <strong>{FRAMEWORK_LABELS[framework]} Framework:</strong>
          <br />
          {FRAMEWORK_DESCRIPTIONS[framework]}
        </Small>
      </div>
    </>
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/20" onClick={handleClose} />

      <div className="relative ml-auto app-sidebar-panel bg-background border-l shadow-xl h-full flex flex-col">
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {renderModeSelection()}
          {mode === "Manual" ? renderManualMode() : renderFrameworkMode()}
        </div>

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
