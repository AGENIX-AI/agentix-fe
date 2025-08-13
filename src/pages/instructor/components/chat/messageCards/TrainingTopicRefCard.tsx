import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExtraSmall, Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { TrainingTopicRefMessageCard } from "./types";
import { useInstructor } from "@/contexts/InstructorContext";
import { useTranslation } from "react-i18next";

interface TrainingTopicRefCardProps {
  card: TrainingTopicRefMessageCard;
  className?: string;
  handleNewMessage?: (newMessage: {
    sender: "student" | "instructor" | "agent";
    content: string;
    invocation_id: string;
  }) => void;
  invocation_id?: string;
}

export function TrainingTopicRefCard({
  card,
  className,
}: TrainingTopicRefCardProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const { setRightPanel, setMetaData, metaData } = useInstructor();

  useEffect(() => {
    // Trigger fade-in animation on mount
    setIsVisible(true);
  }, []);

  const handleGoToDocument = () => {
    console.log("Go to document with ID:", card.document_id);
    setMetaData({
      ...(metaData || {}),
      currentTopicKnowledgeId: card.document_id,
    });
    setRightPanel("topicKnowledgeDetails");
    // Here you would add the actual navigation logic to the document
  };

  return (
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
          <div className="flex flex-col gap-1">
            <Small className="font-bold">
              {t("chat.messageCards.trainingTopicReference")}
            </Small>
          </div>
          <Separator className="my-3" />
        </div>
      </div>
      {/* Content */}
      <div className="p-3 pt-0">
        <div className="space-y-3">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <ExtraSmall className="font-bold text-primary">
                {t("chat.messageCards.title")}
              </ExtraSmall>
            </div>
            <ExtraSmall className="text-xs text-foreground">
              {card.title}
            </ExtraSmall>
          </div>
        </div>
        <Separator className="my-3" />
      </div>

      <div className="flex justify-end gap-3 px-3 pb-3">
        <Button
          variant="default"
          size="sm"
          onClick={handleGoToDocument}
          className="text-xs flex-1 max-w-[150px]"
        >
          {t("chat.messageCards.viewDocument")}
        </Button>
      </div>
    </div>
  );
}
