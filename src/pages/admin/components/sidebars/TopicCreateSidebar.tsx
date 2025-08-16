import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import type { ContentBlock as PlateContentBlock } from "@/components/custom/PlateContentBlockEditor";
import type {
  HelpTopic,
  ContentBlock as ApiContentBlock,
} from "@/api/admin/helpCenter";
import { PlateContentEditor } from "@/components/editor/plate-content-editor";

interface TopicCreateSidebarProps {
  isVisible: boolean;
  mainId: string;
  onClose: () => void;
  onSave: (
    mainId: string,
    topic: Partial<HelpTopic> & { title: string; content: ApiContentBlock[] }
  ) => void;
}

// Convert Plate ContentBlocks to API ContentBlocks
const convertPlateBlocksToApiContent = (
  plateBlocks: PlateContentBlock[]
): ApiContentBlock[] => {
  if (!plateBlocks || plateBlocks.length === 0) return [];

  return plateBlocks.map((block, index) => ({
    type: block.type,
    data: block.data,
    order: index,
  }));
};

export function TopicCreateSidebar({
  isVisible,
  mainId,
  onClose,
  onSave,
}: TopicCreateSidebarProps) {
  const [title, setTitle] = useState("");
  const [contentBlocks, setContentBlocks] = useState<PlateContentBlock[]>([]);

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      console.error("Title is required");
      return;
    }

    // Convert Plate ContentBlocks to API ContentBlocks
    const apiContentBlocks = convertPlateBlocksToApiContent(contentBlocks);
    console.log("Creating topic with API content blocks:", apiContentBlocks);

    const topicData = {
      title: title.trim(),
      content: apiContentBlocks,
    };
    onSave(mainId, topicData);
  }, [title, contentBlocks, mainId, onSave]);

  const handleClose = useCallback(() => {
    setTitle("");
    setContentBlocks([]);
    onClose();
  }, [onClose]);

  const handleEditorSave = useCallback((newBlocks: PlateContentBlock[]) => {
    console.log("Plate editor saved blocks:", newBlocks);
    setContentBlocks(newBlocks);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[800px] bg-background border-l border-border shadow-lg flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-6 h-18">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create New Topic</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Title Input */}
      <div className="p-6 pb-0">
        <div className="space-y-2">
          <Label htmlFor="topic-title">Title</Label>
          <Input
            id="topic-title"
            placeholder="Enter topic title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="h-full flex flex-col">
          <PlateContentEditor
            key="create-editor"
            contentBlocks={[]}
            onSave={handleEditorSave}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-6 h-18">
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Create Topic
          </Button>
        </div>
      </div>
    </div>
  );
}
