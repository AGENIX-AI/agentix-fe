import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { HelpTopic } from "@/api/admin/helpCenter";
import ReactMarkdown from "react-markdown";
import { Large } from "@/components/ui/typography";
import { TiptapContentBlocksViewer } from "@/components/editor/TiptapContentBlocksViewer";

interface HelpContentSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  topicId: string | null;
  fetchHelpTopic: (id: string) => Promise<HelpTopic>;
}

export const HelpContentSidebar = ({
  isVisible,
  onClose,
  topicId,
  fetchHelpTopic,
}: HelpContentSidebarProps) => {
  const [content, setContent] = useState<HelpTopic | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchContent = async () => {
      if (!topicId) return;

      try {
        setIsLoading(true);
        setError(null);
        const helpContent = await fetchHelpTopic(topicId);
        setContent(helpContent);
      } catch (err) {
        setError(
          t(
            "help.content_failed",
            "Failed to load help content. Please try again later."
          )
        );
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
    <div className="fixed inset-y-0 right-0 w-170 bg-background border-l flex flex-col z-50">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-gray-200 flex items-center justify-between p-6 h-18">
        <Large className="font-semibold">{content?.title}</Large>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-xs">{error}</div>
        ) : content ? (
          <div className="space-y-2">
            {Array.isArray(content.content) ? (
              <TiptapContentBlocksViewer blocks={content.content} />
            ) : (
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-[16px] font-bold mb-2">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-[14px] font-bold mb-2">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-[12px] font-bold mb-1">{children}</h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-[10px] font-bold mb-1">{children}</h4>
                  ),
                  h5: ({ children }) => (
                    <h5 className="text-xs font-bold mb-1">{children}</h5>
                  ),
                  h6: ({ children }) => (
                    <h6 className="text-xs font-bold mb-1">{children}</h6>
                  ),
                  p: ({ children }) => (
                    <p className="text-xs mb-2">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="text-xs list-disc pl-4 mb-2 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="text-xs list-decimal pl-4 mb-2 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="text-xs">{children}</li>,
                  strong: ({ children }) => (
                    <strong className="text-xs font-bold">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="text-xs italic">{children}</em>
                  ),
                  code: ({ children }) => (
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="text-xs border-l-2 border-gray-300 pl-3 italic">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {content.content}
              </ReactMarkdown>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-xs">
            {t("help.select_topic", "Select a topic to view its content")}
          </div>
        )}
      </div>
    </div>
  );
};
