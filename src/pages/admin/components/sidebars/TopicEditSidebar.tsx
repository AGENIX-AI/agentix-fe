import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { fetchHelpTopic } from "@/api/admin/helpCenter";
import { fetchHelpTopic as fetchInstructorHelpTopic } from "@/api/admin/helpCenterInstructor";

interface TopicEditSidebarProps {
  isVisible: boolean;
  mainId: string;
  topic: HelpTopic;
  onSave: (
    mainId: string,
    topic: Partial<HelpTopic> & { title: string; content: ApiContentBlock[] }
  ) => void;
  onClose: () => void;
  activeTab?: "student" | "instructor";
}

// Convert API ContentBlocks to Plate ContentBlocks
const convertApiContentToPlateBlocks = (
  apiContent: ApiContentBlock[]
): PlateContentBlock[] => {
  if (!apiContent || apiContent.length === 0) return [];

  return apiContent.map((block, index) => {
    return {
      id: block.id, // Use the existing ID from API, don't generate new one
      type: block.type,
      data: block.data,
      order: index,
      section: block.section_id, // Use section_id from API
      // Store the original block_id if it exists for later API updates
      originalBlockId: block.block_id || block.id, // Use block.id as originalBlockId if block_id doesn't exist
    };
  });
};

// Convert Plate ContentBlocks back to API ContentBlocks
const convertPlateBlocksToApiContent = (
  plateBlocks: PlateContentBlock[]
): ApiContentBlock[] => {
  if (!plateBlocks || plateBlocks.length === 0) return [];

  return plateBlocks.map((block, index) => ({
    id: block.id,
    type: block.type,
    data: block.data,
    order: index,
    section_id: block.section, // Map section back to section_id
    // Include block_id: null for new blocks, original ID for existing blocks
    block_id: block.originalBlockId || null,
  }));
};

export function TopicEditSidebar({
  isVisible,
  mainId,
  topic,
  onClose,
  onSave,
  activeTab = "student",
}: TopicEditSidebarProps) {
  const [title, setTitle] = useState("");
  const [contentBlocks, setContentBlocks] = useState<PlateContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use ref to track current content for comparison without causing re-renders
  const currentContentRef = useRef<PlateContentBlock[]>([]);

  // Initialize content blocks from existing topic immediately
  useEffect(() => {
    if (isVisible && topic && !isInitialized) {
      setTitle(topic.title);

      // Convert API content to Plate content blocks
      const initialBlocks = convertApiContentToPlateBlocks(topic.content || []);
      setContentBlocks(initialBlocks);
      currentContentRef.current = initialBlocks;
      setIsInitialized(true);
    }
  }, [isVisible, topic, isInitialized]);

  // Fetch full topic content from API (optional enhancement)
  useEffect(() => {
    if (isVisible && topic && isInitialized) {
      setIsLoading(true);
      setError(null);

      const fetchTopicContent = async () => {
        try {
          const apiFunction =
            activeTab === "instructor"
              ? fetchInstructorHelpTopic
              : fetchHelpTopic;
          const fullTopic = await apiFunction(topic.id);

          // Convert API content to Plate content blocks
          const apiBlocks = convertApiContentToPlateBlocks(fullTopic.content);

          // Only update if the content is actually different
          const isContentDifferent =
            fullTopic.title !== title ||
            JSON.stringify(apiBlocks) !==
              JSON.stringify(currentContentRef.current);

          if (isContentDifferent) {
            setTitle(fullTopic.title);
            setContentBlocks(apiBlocks);
            currentContentRef.current = apiBlocks;
          }
        } catch (err) {
          setError("Failed to load topic content. Please try again.");
          // Keep the current content, don't reset
        } finally {
          setIsLoading(false);
        }
      };

      fetchTopicContent();
    }
  }, [isVisible, topic, isInitialized, activeTab, title]); // Removed contentBlocks dependency

  // Reset state when sidebar closes
  useEffect(() => {
    if (!isVisible) {
      setIsInitialized(false);
      setTitle("");
      setContentBlocks([]);
      setIsLoading(false);
      setError(null);
    }
  }, [isVisible]);

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      return;
    }

    // Convert Plate ContentBlocks to API ContentBlocks
    const apiContentBlocks = convertPlateBlocksToApiContent(contentBlocks);

    const topicData = {
      id: topic?.id,
      title: title.trim(),
      content: apiContentBlocks,
    };
    onSave(mainId, topicData);
  }, [title, contentBlocks, topic?.id, mainId, onSave]);

  const handleEditorSave = useCallback(
    (newBlocks: PlateContentBlock[]) => {
      setContentBlocks(newBlocks);
      currentContentRef.current = newBlocks; // Keep ref in sync
    },
    [] // Remove dependency to prevent infinite re-renders
  );

  if (!isVisible) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[800px] bg-background border-l border-border shadow-lg flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-6 h-18">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Topic</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
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
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading content...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-destructive">{error}</div>
            </div>
          ) : (
            <PlateContentEditor
              key={`editor-${topic?.id}`}
              contentBlocks={contentBlocks}
              onSave={handleEditorSave}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-6 h-18">
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
