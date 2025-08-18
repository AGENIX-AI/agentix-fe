import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { TiptapContentBlocksEditor } from "@/components/editor/TiptapContentBlocksEditor";
import type { HelpTopic, ContentBlock } from "@/api/admin/helpCenter";
import { fetchHelpTopic } from "@/api/admin/helpCenter";
import { fetchHelpTopic as fetchInstructorHelpTopic } from "@/api/admin/helpCenterInstructor";
// Styles are imported within the editor component

interface TopicEditSidebarProps {
  isVisible: boolean;
  mainId: string;
  topic: HelpTopic;
  onSave: (
    mainId: string,
    topic: Partial<HelpTopic> & { title: string; content: ContentBlock[] }
  ) => void;
  onClose: () => void;
  activeTab?: "student" | "instructor";
}

export function TopicEditSidebar({
  isVisible,
  mainId,
  topic,
  onClose,
  onSave,
  activeTab = "student",
}: TopicEditSidebarProps) {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(
    topic?.content || []
  );
  const previousBlocksRef = useRef<ContentBlock[]>(topic?.content || []);

  // Initialize content from existing topic
  useEffect(() => {
    if (isVisible && topic && !isInitialized) {
      setTitle(topic.title);
      setContentBlocks(topic.content || []);
      previousBlocksRef.current = topic.content || [];
      setIsInitialized(true);
    }
  }, [isVisible, topic, isInitialized]);

  // Fetch full topic content from API
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

          if (fullTopic.title !== title) {
            setTitle(fullTopic.title);
          }

          setContentBlocks(fullTopic.content || []);
          previousBlocksRef.current = fullTopic.content || [];
        } catch (err) {
          setError("Failed to load topic content. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchTopicContent();
    }
  }, [isVisible, topic, isInitialized, activeTab, title]);

  // Reset state when sidebar closes
  useEffect(() => {
    if (!isVisible) {
      setIsInitialized(false);
      setTitle("");
      setIsLoading(false);
      setError(null);
      setContentBlocks([]);
    }
  }, [isVisible]);

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      return;
    }
    const topicData = {
      id: topic?.id,
      title: title.trim(),
      content: contentBlocks,
    };
    onSave(mainId, topicData);
    previousBlocksRef.current = contentBlocks;
  }, [title, contentBlocks, topic?.id, mainId, onSave]);

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
            <TiptapContentBlocksEditor
              blocks={contentBlocks}
              previousBlocks={previousBlocksRef.current}
              onChange={setContentBlocks}
              placeholder="Type '/' for commands..."
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
