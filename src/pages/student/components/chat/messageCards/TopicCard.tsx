import { useState, useEffect } from "react";

import type { TopicMessageCard } from "./types";
import { Separator } from "@/components/ui/separator";
import { ExtraSmall, Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface TopicCardProps {
  card: TopicMessageCard;
  className?: string;
  onSubmit?: (updatedCard: TopicMessageCard) => void;
}

export function TopicCard({ card, className }: TopicCardProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation on mount
    setIsVisible(true);
  }, []);

  return (
    <div
      className={cn(
        "w-full border border-border rounded-xl bg-card shadow-sm transition-all duration-300 ease-in-out font-sans",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
    >
      {/* Header */}
      <div className="rounded-t-xl p-3 pb-0">
        <div className="text-primary">
          <div className="flex flex-col gap-1">
            <Small className="font-bold">{card.topic_name}</Small>
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
                {t("chat.topicCard.goal", "Goal")}
              </ExtraSmall>
            </div>
            <ExtraSmall className="text-xs text-foreground">
              {card.topic_goal}
            </ExtraSmall>
          </div>

          {card.topic_problem && (
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-3">
                <ExtraSmall className="font-bold text-primary">
                  {t("chat.topicCard.problem", "Problem")}
                </ExtraSmall>
              </div>
              <ExtraSmall className="text-xs text-foreground">
                {card.topic_problem}
              </ExtraSmall>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
