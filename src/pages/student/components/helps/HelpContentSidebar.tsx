import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getHelpContent } from "@/api/systems";
import type { HelpContent } from "@/api/systems";
import ReactMarkdown from "react-markdown";

interface HelpContentSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  topicId: string | null;
}

export const HelpContentSidebar = ({
  isVisible,
  onClose,
  topicId,
}: HelpContentSidebarProps) => {
  const [content, setContent] = useState<HelpContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!topicId) return;

      try {
        setIsLoading(true);
        setError(null);
        const helpContent = await getHelpContent(topicId);
        setContent(helpContent);
      } catch (err) {
        setError("Failed to load help content. Please try again later.");
        console.error("Error fetching help content:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isVisible && topicId) {
      fetchContent();
    }
  }, [isVisible, topicId]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-lg border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center justify-between p-4">
        <h2 className="font-medium text-xs">
          {content?.show_text || "Help Content"}
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-xs">{error}</div>
        ) : content ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{content.content}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-gray-500 text-xs">
            Select a topic to view its content
          </div>
        )}
      </div>
    </div>
  );
};
