import { processMessageContent } from "@/lib/utils/message-content-parse";
import { useRef, useEffect, memo, useState, useCallback } from "react";
import { ImageViewer } from "./ImageViewer";
import { parseMessageCard } from "../../../pages/instructor/components/chat/messageCards/types";
import { MessageCardRenderer } from "../../../pages/instructor/components/chat/messageCards/MessageCardRenderer";
import { useTranslation } from "react-i18next";

interface UserInfo {
  id: string;
  name: string;
  avatar_url: string;
}

interface MessageContentProps {
  content: string;
  messageIndex: number;
  invocation_id: string;
  conversationData?: {
    studentInfo?: UserInfo;
    instructorInfo?: UserInfo;
    assistantInfo?: {
      id: string;
      name: string;
      tagline: string;
      image: string;
    };
  };
}

// Function to parse mentions and convert UUIDs to user names
function parseMentions(
  content: string,
  conversationData?: MessageContentProps["conversationData"]
): string {
  if (!content || !conversationData) return content;

  // Regex to match @<uuid> pattern
  const mentionRegex = /@([a-f0-9-]{36})/g;

  return content.replace(mentionRegex, (match, userId) => {
    // Check if the UUID matches any user in conversation data
    if (
      conversationData.studentInfo &&
      conversationData.studentInfo.id === userId
    ) {
      return `<strong>@${conversationData.studentInfo.name}</strong>`;
    }

    if (
      conversationData.instructorInfo &&
      conversationData.instructorInfo.id === userId
    ) {
      return `<strong>@${conversationData.instructorInfo.name}</strong>`;
    }

    if (
      conversationData.assistantInfo &&
      conversationData.assistantInfo.id === userId
    ) {
      return `<strong>@${conversationData.assistantInfo.name}</strong>`;
    }

    // If no match found, return original mention
    return match;
  });
}

function MessageContentComponent({
  content,
  messageIndex,
  invocation_id,
  conversationData,
}: MessageContentProps) {
  // State for image viewer
  const { t } = useTranslation();

  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  // Parse mentions first, before any other processing
  const parsedContent = parseMentions(content, conversationData);

  // Remove [Instructor] and [Student] prefixes from the parsed content BEFORE parsing message card
  let cleanedOriginalContent = parsedContent;
  if (
    cleanedOriginalContent
      .trim()
      .startsWith("[" + t("common.instructor", "Instructor"))
  ) {
    cleanedOriginalContent = cleanedOriginalContent.replace(
      /^\s*\[Instructor\s*:\s*[^\]]+\]\s*:\s*/,
      ""
    );
  } else if (
    cleanedOriginalContent
      .trim()
      .startsWith("[" + t("common.student", "Student"))
  ) {
    cleanedOriginalContent = cleanedOriginalContent.replace(
      /^\s*\[Student\s*:\s*[^\]]+\]\s*:\s*/,
      ""
    );
  }

  // Parse message card from the cleaned content
  const { card, remainingContent } = parseMessageCard(cleanedOriginalContent);

  // Process the remaining content (or all content if no card)
  const { cleanedContent, imageUrls } = processMessageContent(
    remainingContent || cleanedOriginalContent
  );
  console.log(imageUrls);
  // Reference to the content div
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle image click - memoized to prevent unnecessary re-renders
  const handleImageClick = useCallback((imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    setIsImageViewerOpen(true);
  }, []);

  // Effect to add click handlers to images
  useEffect(() => {
    if (!contentRef.current) return;

    const images = contentRef.current.querySelectorAll("img");

    const clickHandler = (e: Event) => {
      e.preventDefault();
      const target = e.target as HTMLImageElement;
      if (target.src) {
        handleImageClick(target.src);
      }
    };

    // Add click handlers
    images.forEach((img) => {
      img.addEventListener("click", clickHandler);
      if (img instanceof HTMLElement) {
        img.style.cursor = "pointer";
      }
    });

    // Cleanup
    return () => {
      images.forEach((img) => {
        img.removeEventListener("click", clickHandler);
      });
    };
  }, [cleanedContent, isImageViewerOpen, handleImageClick]);

  // Render LaTeX content after component mounts or content changes
  useEffect(() => {
    if (!contentRef.current || typeof window === "undefined") return;

    // Load and render KaTeX only if the content includes LaTeX delimiters
    if (cleanedContent.includes("$$") || cleanedContent.includes("$")) {
      const loadAndRenderKaTeX = async () => {
        try {
          // Dynamically import KaTeX
          // const katex = await import("katex");
          const { default: renderMathInElement } = await import(
            "katex/contrib/auto-render"
          );

          if (contentRef.current) {
            renderMathInElement(contentRef.current, {
              delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
              ],
              throwOnError: false,
              output: "html",
            });
          }
        } catch (error) {
          console.error("Error rendering LaTeX:", error);
        }
      };

      loadAndRenderKaTeX();
    }
  }, [cleanedContent]);

  return (
    <div className="!p-0 !m-0" style={{ padding: 0, margin: 0 }}>
      {/* Render message card if present */}
      {card && (
        <MessageCardRenderer card={card} invocation_id={invocation_id} />
      )}

      {/* Render content with inline images, lists, and LaTeX */}
      {cleanedContent && (
        <div
          ref={contentRef}
          className={`
                       message_content 
            render_markdown 
            text-xs 
            font-['Inter',sans-serif] 
            [&_ol]:list-decimal 
            [&_ul]:list-disc 
            [&_li]:!m-0
            [&_li]:!p-1
            [&_li]:!ml-3
            [&_p]:mb-1 
            [&_h1]:mb-1 
            [&_h2]:mb-1 
            [&_h3]:mb-1 
            [&_h4]:mb-1 
            [&_h5]:mb-1 
            [&_h6]:mb-1 
            [&_img]:max-h-64 
            [&_img]:max-w-full 
            [&_img]:rounded-md 
            [&_img]:object-contain 
            [&_strong]:font-bold 
            [&_.katex-display]:overflow-x-auto 
            [&_.katex]:text-xs 
            [&_.katex]:text-current 
            [&_h1]:text-xs 
            [&_h2]:text-xs 
            [&_h3]:text-xs 
            [&_h4]:text-xs 
            [&_h5]:text-xs 
            [&_h6]:text-xs 
            [&_p]:text-xs 
            [&_h1]:font-normal 
            [&_h2]:font-normal 
            [&_h3]:font-normal 
            [&_h4]:font-normal 
            [&_h5]:font-normal 
            [&_h6]:font-normal 
            [&_ul]:!m-0 
            [&_ul]:!p-0 
            [&_ol]:!m-0 
            [&_ol]:!p-0
            [&_.code-block-container]:my-2
            [&_.code-block-container]:max-w-full
            [&_.code-block-container]:overflow-hidden
            [&_.code-block-container]:border-border
            [&_.code-block-container]:rounded-md
            [&_.code-block-header]:bg-muted
            [&_.code-block-header]:px-3
            [&_.code-block-header]:py-1.5
            [&_.code-block-header]:text-xs
            [&_.code-block-header]:font-medium
            [&_.code-block-header]:text-muted-foreground
            [&_.code-block-header]:border-b
            [&_.code-block-header]:border-border
            [&_.code-block]:bg-muted/50
            [&_.code-block]:p-3
            [&_.code-block]:overflow-x-auto
            [&_.code-block]:text-xs
            [&_.code-block]:font-mono
            [&_.code-block]:leading-relaxed
            [&_.code-block]:whitespace-pre-wrap
            [&_.code-block]:break-words
            [&_.code-block]:max-w-full
            [&_.code-block]:min-w-0
            [&_.code-block]:text-foreground
            [&_.inline-code]:bg-muted
            [&_.inline-code]:px-1
            [&_.inline-code]:py-0.5
            [&_.inline-code]:rounded
            [&_.inline-code]:text-xs
            [&_.inline-code]:font-mono
            [&_.inline-code]:text-foreground
          `}
          style={{
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.5,
          }}
          dangerouslySetInnerHTML={{ __html: cleanedContent }}
        />
      )}

      {/* Image viewer for clickable images - only create one instance per message */}
      {isImageViewerOpen && (
        <ImageViewer
          key={`image-viewer-${messageIndex}`}
          // imageUrls={imageUrls}
          currentImageUrl={currentImageUrl}
          onClose={() => setIsImageViewerOpen(false)}
        />
      )}
    </div>
  );
}

export const MessageContent = memo(
  MessageContentComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.content === nextProps.content &&
      prevProps.messageIndex === nextProps.messageIndex
    );
  }
);
