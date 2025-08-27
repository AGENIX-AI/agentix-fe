import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { X, Edit, Trash2 } from "lucide-react";
// import type { ContentBlock as PlateContentBlock } from "@/components/custom/PlateContentBlockEditor";
import type {
  HelpTopic,
  ContentBlock as ApiContentBlock,
} from "@/api/admin/helpCenter";
import { fetchHelpTopic } from "@/api/admin/helpCenter";
import { fetchHelpTopic as fetchInstructorHelpTopic } from "@/api/admin/helpCenterInstructor";

interface TopicViewSidebarProps {
  isVisible: boolean;
  topic: HelpTopic;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (topicId: string) => void;
  activeTab?: "student" | "instructor";
}

// Convert API ContentBlocks to Plate ContentBlocks for display
const convertApiContentToPlateBlocks = (
  apiContent: ApiContentBlock[]
): any[] => {
  if (!apiContent || apiContent.length === 0) return [];

  return apiContent.map((block, index) => {
    return {
      id: block.id, // Use the existing ID from API, don't generate new one
      type: block.type,
      data: block.data,
      order: index,
      // section_id and block_id removed per new interface; id is the block id
    };
  });
};

// Local alias for rendering content blocks
type PlateContentBlock = ApiContentBlock;

// Render content blocks in read-only mode
const renderContentBlocks = (blocks: PlateContentBlock[]) => {
  return blocks.map((block, index) => {
    switch (block.type) {
      case "header":
        const level = block.data.level || 1;
        if (level === 1) {
          return (
            <h1 key={block.id || index} className="text-2xl font-bold mb-2">
              {block.data.text}
            </h1>
          );
        } else if (level === 2) {
          return (
            <h2 key={block.id || index} className="text-xl font-bold mb-2">
              {block.data.text}
            </h2>
          );
        } else if (level === 3) {
          return (
            <h3 key={block.id || index} className="text-lg font-bold mb-2">
              {block.data.text}
            </h3>
          );
        } else {
          return (
            <h4 key={block.id || index} className="text-base font-bold mb-2">
              {block.data.text}
            </h4>
          );
        }

      case "paragraph":
        return (
          <p key={block.id || index} className="mb-3">
            {block.data.text}
          </p>
        );

      case "list":
        const ListTag = block.data.style === "ordered" ? "ol" : "ul";
        return (
          <ListTag key={block.id || index} className="mb-3 ml-4">
            {block.data.items.map((item: string, itemIndex: number) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ListTag>
        );

      case "code":
        return (
          <pre
            key={block.id || index}
            className="bg-muted p-3 rounded mb-3 overflow-x-auto"
          >
            <code className={`language-${block.data.language}`}>
              {block.data.code}
            </code>
          </pre>
        );

      case "quote":
        return (
          <blockquote
            key={block.id || index}
            className="border-l-4 border-primary pl-4 italic mb-3"
          >
            <p>{block.data.text}</p>
            {block.data.caption && (
              <cite className="text-sm text-muted-foreground">
                — {block.data.caption}
              </cite>
            )}
          </blockquote>
        );

      case "image":
        return (
          <figure key={block.id || index} className="mb-3">
            <img
              src={block.data.url}
              alt={block.data.caption || "Image"}
              className="max-w-full h-auto rounded"
            />
            {block.data.caption && (
              <figcaption className="text-sm text-muted-foreground text-center mt-2">
                {block.data.caption}
              </figcaption>
            )}
          </figure>
        );

      case "url":
        return (
          <div key={block.id || index} className="mb-3">
            <a
              href={block.data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {block.data.title || block.data.url}
            </a>
          </div>
        );

      case "separator":
        return <hr key={block.id || index} className="my-4" />;

      default:
        return null;
    }
  });
};

export function TopicViewSidebar({
  isVisible,
  topic,
  onClose,
  onEdit,
  onDelete,
  activeTab = "student",
}: TopicViewSidebarProps) {
  const navigate = useNavigate();
  const [fullTopic, setFullTopic] = useState<HelpTopic | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize with topic data immediately
  useEffect(() => {
    if (isVisible && topic && !isInitialized) {
      setFullTopic(topic);
      setIsInitialized(true);
      console.log("View sidebar initialized with topic data");
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
          const fetchedTopic = await apiFunction(topic.id);

          // Only update if content is different
          const isContentDifferent =
            fetchedTopic.title !== topic.title ||
            JSON.stringify(fetchedTopic.content) !==
              JSON.stringify(topic.content);

          if (isContentDifferent) {
            console.log("Updating view content from API");
            setFullTopic(fetchedTopic);
          } else {
            console.log("View content unchanged, keeping current data");
          }
        } catch (err) {
          console.error("Failed to fetch topic content:", err);
          setError("Failed to load topic content. Please try again.");
          // Keep the current content, don't reset
        } finally {
          setIsLoading(false);
        }
      };

      fetchTopicContent();
    }
  }, [isVisible, topic, isInitialized, activeTab]);

  // Reset state when sidebar closes
  useEffect(() => {
    if (!isVisible) {
      setIsInitialized(false);
      setFullTopic(null);
      setIsLoading(false);
      setError(null);
    }
  }, [isVisible]);

  const handleDelete = useCallback(() => {
    if (confirm("Are you sure you want to delete this topic?")) {
      onDelete(topic.id);
    }
  }, [onDelete, topic.id]);

  if (!isVisible) return null;

  const displayTopic = fullTopic || topic;
  const contentBlocks = displayTopic
    ? convertApiContentToPlateBlocks(displayTopic.content || [])
    : [];

  return (
    <div className="fixed inset-y-0 right-0 z-50 app-sidebar-panel bg-background border-l border-border shadow-lg flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-6 h-18">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">View Topic</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                navigate(
                  `/admin/help-center/topics/${topic.id}/edit?tab=${activeTab}`
                )
              }
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="text-sm text-muted-foreground">
                Checking for updates...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-6">
            <div className="text-destructive mb-4">
              <strong>Error:</strong> {error}
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <h1 className="text-2xl font-bold mb-6">{displayTopic?.title}</h1>
            {contentBlocks.length > 0 ? (
              renderContentBlocks(contentBlocks)
            ) : (
              <p className="text-muted-foreground">No content available.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-6 h-18">
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onEdit}>
            Edit Topic
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
