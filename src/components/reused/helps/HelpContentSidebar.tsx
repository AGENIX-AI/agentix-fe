import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { HelpTopic } from "@/api/admin/helpCenter";
import ReactMarkdown from "react-markdown";
import { Large } from "@/components/ui/typography";

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
          <div className="text-xs space-y-2">
            {Array.isArray(content.content) ? (
              // Render content blocks directly
              <div className="space-y-3">
                {content.content.map((block, index) => {
                  switch (block.type) {
                    case "header":
                      const level = block.data.level || 1;
                      const headerText = block.data.text || "";

                      switch (level) {
                        case 1:
                          return (
                            <h1
                              key={index}
                              className="text-[16px] font-bold mb-2"
                            >
                              {headerText}
                            </h1>
                          );
                        case 2:
                          return (
                            <h2
                              key={index}
                              className="text-[14px] font-bold mb-2"
                            >
                              {headerText}
                            </h2>
                          );
                        case 3:
                          return (
                            <h3
                              key={index}
                              className="text-[12px] font-bold mb-1"
                            >
                              {headerText}
                            </h3>
                          );
                        case 4:
                          return (
                            <h4
                              key={index}
                              className="text-[10px] font-bold mb-1"
                            >
                              {headerText}
                            </h4>
                          );
                        case 5:
                          return (
                            <h5 key={index} className="text-xs font-bold mb-1">
                              {headerText}
                            </h5>
                          );
                        case 6:
                          return (
                            <h6 key={index} className="text-xs font-bold mb-1">
                              {headerText}
                            </h6>
                          );
                        default:
                          return (
                            <h2
                              key={index}
                              className="text-[14px] font-bold mb-2"
                            >
                              {headerText}
                            </h2>
                          );
                      }
                    case "paragraph":
                      return (
                        <p key={index} className="text-xs mb-2">
                          {block.data.text}
                        </p>
                      );
                    case "list":
                      const ListTag =
                        block.data.style === "ordered" ? "ol" : "ul";
                      return (
                        <ListTag
                          key={index}
                          className={`text-xs list-disc pl-4 mb-2 space-y-1 ${
                            block.data.style === "ordered"
                              ? "list-decimal"
                              : "list-disc"
                          }`}
                        >
                          {block.data.items.map(
                            (item: string, itemIndex: number) => (
                              <li key={itemIndex}>{item}</li>
                            )
                          )}
                        </ListTag>
                      );
                    case "code":
                      return (
                        <pre
                          key={index}
                          className="text-xs bg-gray-100 p-2 rounded overflow-x-auto"
                        >
                          <code>{block.data.code}</code>
                        </pre>
                      );
                    case "quote":
                      return (
                        <blockquote
                          key={index}
                          className="text-xs border-l-2 border-gray-300 pl-3 italic mb-2"
                        >
                          {block.data.text}
                          {block.data.caption && (
                            <div className="text-gray-600 mt-1">
                              — {block.data.caption}
                            </div>
                          )}
                        </blockquote>
                      );
                    case "image":
                      return (
                        <div key={index} className="mb-2">
                          <img
                            src={block.data.url}
                            alt={block.data.caption || "Image"}
                            className="max-w-full h-auto rounded"
                          />
                          {block.data.caption && (
                            <p className="text-xs text-gray-600 mt-1">
                              {block.data.caption}
                            </p>
                          )}
                        </div>
                      );
                    case "url":
                      return (
                        <div key={index} className="mb-2">
                          <a
                            href={block.data.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                          >
                            {block.data.title || block.data.url}
                          </a>
                        </div>
                      );
                    case "separator":
                      return (
                        <hr key={index} className="my-3 border-gray-300" />
                      );
                    case "checklist":
                      return (
                        <div key={index} className="mb-2">
                          {block.data.items.map(
                            (item: any, itemIndex: number) => (
                              <div
                                key={itemIndex}
                                className="flex items-center gap-2 text-xs mb-1"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  readOnly
                                  className="mr-2"
                                />
                                <span
                                  className={
                                    item.checked
                                      ? "line-through text-gray-500"
                                      : ""
                                  }
                                >
                                  {item.text}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      );
                    default:
                      return (
                        <p key={index} className="text-xs mb-2">
                          {JSON.stringify(block.data)}
                        </p>
                      );
                  }
                })}
              </div>
            ) : (
              // Fallback for string content
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
