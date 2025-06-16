import { cn } from "@/lib/utils";
import type { LearningTopicMessageCard } from "./types";
import { Separator } from "@/components/ui/separator";
import { ExtraSmall, Small } from "@/components/ui/typography";

interface LearningTopicCardProps {
  card: LearningTopicMessageCard;
  className?: string;
}

export function LearningTopicCard({ card, className }: LearningTopicCardProps) {
  const cardContent = (
    <div
      className={cn(
        "w-full mb-3 border border-primary/20 rounded-xl bg-card shadow-sm transition-all duration-300 ease-in-out font-sans",
        className
      )}
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
    >
      {/* Header */}
      <div className="p-3 rounded-t-xl">
        <div className="text-primary">
          <div className="flex flex-col gap-1">
            <Small className="font-bold">{card.topic_name}</Small>
            {card.language && (
              <ExtraSmall className="text-primary">
                Language: {card.language}
              </ExtraSmall>
            )}
          </div>
        </div>
        <Separator className="mt-3" />
      </div>

      {/* Content */}
      <div className="px-3 pb-3">
        <div className="space-y-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <ExtraSmall className="font-bold text-primary">Focus</ExtraSmall>
            </div>
            <ExtraSmall className="text-xs text-foreground">
              {card.focus_on}
            </ExtraSmall>
          </div>
        </div>
      </div>
    </div>
  );

  return cardContent;
}
