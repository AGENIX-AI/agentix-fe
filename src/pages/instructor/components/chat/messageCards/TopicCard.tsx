import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export function TopicCard({ card, className, onSubmit }: TopicCardProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState<Omit<TopicMessageCard, "type">>({
    topic_name: card.topic_name,
    topic_goal: card.topic_goal,
    topic_problem: card.topic_problem,
    language: card.language,
    topic_type: card.topic_type,
  });

  useEffect(() => {
    // Trigger fade-in animation on mount
    console.log(onSubmit, setIsEditing);
    setIsVisible(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
          {isEditing ? (
            <Input
              name="language"
              value={formData.language || ""}
              onChange={handleChange}
              className="text-xs"
              placeholder={t('chat.topicCard.language')}
            />
          ) : (
            <div className="flex flex-col gap-1">
              <Small className="font-bold">{card.topic_name}</Small>
            </div>
          )}
          <Separator className="my-3" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 pt-0">
        <div className="space-y-3">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <ExtraSmall className="font-bold text-primary">{t('chat.topicCard.goal')}</ExtraSmall>
            </div>
            {isEditing ? (
              <Textarea
                name="topic_goal"
                value={formData.topic_goal}
                onChange={handleChange}
                className="min-h-[80px] text-xs"
                placeholder={t('chat.topicCard.goalPlaceholder')}
              />
            ) : (
              <ExtraSmall className="text-xs text-foreground">
                {card.topic_goal}
              </ExtraSmall>
            )}
          </div>

          {card.topic_problem && (
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-3">
                <ExtraSmall className="font-bold text-primary">
                  {t('chat.topicCard.problem')}
                </ExtraSmall>
              </div>
              {isEditing ? (
                <Textarea
                  name="topic_problem"
                  value={formData.topic_problem}
                  onChange={handleChange}
                  className="min-h-[80px] text-xs"
                  placeholder={t('chat.topicCard.problemPlaceholder')}
                />
              ) : (
                <ExtraSmall className="text-xs text-foreground">
                  {card.topic_problem}
                </ExtraSmall>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
