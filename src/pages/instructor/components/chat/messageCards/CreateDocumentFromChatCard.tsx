import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { CreateDocumentFromChatMessageCard } from "./types";
import { Small, ExtraSmall } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { FileIcon, FileText, Loader2, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInstructor } from "@/contexts/InstructorContext";

interface CreateDocumentFromChatCardProps {
  card: CreateDocumentFromChatMessageCard;
  className?: string;
  handleNewMessage?: (message: {
    sender: "student" | "instructor" | "agent";
    content: string;
    invocation_id: string;
  }) => void;
  invocation_id?: string;
}

export function CreateDocumentFromChatCard({
  card,
  className,
  handleNewMessage,
  invocation_id,
}: CreateDocumentFromChatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { metaData, setMetaData, setRightPanel } = useInstructor();

  useEffect(() => {
    // Trigger fade-in animation on mount
    setIsVisible(true);
  }, []);

  const openDocument = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // Get the file path from the card
      if (!setMetaData) return;
      const filePath = card.filepath;
      console.log(filePath);

      // Set the document path in the context and switch to review panel
      setMetaData({
        ...metaData,
        reviewDocumentPath: filePath,
      });

      // Switch to the review document panel
      setRightPanel("reviewDocument");
    } catch (error) {
      console.error("Error opening document:", error);
      setError("Failed to open document for review");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDocument = () => {
    openDocument();
  };

  const handleSubmit = () => {
    // Logic for submitting the document
    if (handleNewMessage && invocation_id) {
      handleNewMessage({
        sender: "instructor",
        content: `Document at ${card.filepath} has been submitted.`,
        invocation_id: invocation_id,
      });
    }
  };

  // Styled similarly to LearningTopicCard
  return (
    <>
      <div
        className={cn(
          "w-full mb-3 border border-primary/20 rounded-xl bg-card shadow-sm transition-all duration-300 ease-in-out font-sans",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          className
        )}
        style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
      >
        {/* Header */}
        <div className="rounded-t-xl p-3 pb-0">
          <div className="text-primary">
            <div className="flex items-center gap-2">
              <FileIcon size={16} />
              <Small className="font-bold">Document Created</Small>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <Separator className="my-3" />
        </div>

        {/* Content */}
        <div className="p-3 pt-0">
          <div className="space-y-3">
            {card.topic && (
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-3">
                  <ExtraSmall className="font-bold text-primary">
                    Topic
                  </ExtraSmall>
                </div>
                <ExtraSmall className="text-xs text-foreground">
                  {card.topic}
                </ExtraSmall>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 px-3 pb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenDocument}
              className="flex items-center gap-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="mr-1 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <FileText size={14} />
                  Open
                </>
              )}
            </Button>
            <Button size="sm" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
