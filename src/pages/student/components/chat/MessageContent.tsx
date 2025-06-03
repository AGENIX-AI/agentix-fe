import { processMessageContent } from "./utils";
import { useRef, useEffect, memo, useState, useCallback } from "react";
import { ImageViewer } from "./ImageViewer";
import { cn } from "@/lib/utils";
import { parseMessageCard } from "./messageCards/types";
import { MessageCardRenderer } from "./messageCards/MessageCardRenderer";

interface MessageContentProps {
  content: string;
  messageIndex: number;
}

function MessageContentComponent({
  content,
  messageIndex,
}: MessageContentProps) {
  // State for image viewer
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  // Parse message card if present
  const { card, remainingContent } = parseMessageCard(content);

  // Process the remaining content (or all content if no card)
  const { cleanedContent, imageUrls } = processMessageContent(
    remainingContent || content
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
    <div className="">
      {/* Render message card if present */}
      {card && <MessageCardRenderer card={card} />}

      {/* Render content with inline images, lists, and LaTeX */}
      {cleanedContent && (
        <div
          ref={contentRef}
          className={cn(
            "message_content render_markdown prose",
            "[&_ol]:list-decimal [&_ul]:list-disc",
            "[&_ol]:my-4 [&_ul]:my-4 [&_li]:mt-1",
            "text-xs font-['Inter',sans-serif]",
            "[&_img]:max-h-64 [&_img]:max-w-full [&_img]:rounded-md [&_img]:object-contain",
            "[&_strong]:font-bold",
            "[&_.katex-display]:overflow-x-auto [&_.katex-display]:py-2",
            "[&_.katex]:text-xs [&_.katex]:text-current",
            "[&_h1]:text-xs [&_h2]:text-xs [&_h3]:text-xs [&_h4]:text-xs [&_h5]:text-xs [&_h6]:text-xs [&_p]:text-xs",
            "[&_h1]:font-normal [&_h2]:font-normal [&_h3]:font-normal [&_h4]:font-normal [&_h5]:font-normal [&_h6]:font-normal"
          )}
          style={{ fontFamily: "Inter, sans-serif" }}
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
