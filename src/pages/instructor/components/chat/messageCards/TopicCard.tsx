import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TopicMessageCard } from "./types";
import { Separator } from "@/components/ui/separator";
import { ExtraSmall, Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface TopicCardProps {
  card: TopicMessageCard;
  className?: string;
  onSubmit?: (updatedCard: TopicMessageCard) => void;
}

export function TopicCard({ card, className, onSubmit }: TopicCardProps) {
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
    <Card
      className={cn(
        "w-[100%] mb-3 border border-primary/20 rounded-xl from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-sm transition-all duration-300 ease-in-out font-sans",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
    >
      <CardHeader className="rounded-t-xl">
        {isEditing ? (
          <Input
            name="language"
            value={formData.language || ""}
            onChange={handleChange}
            className="text-xs"
            placeholder="Language (optional)"
          />
        ) : (
          <CardDescription className="text-xs text-primary">
            <div className="flex flex-col gap-2 space-y-2">
              <Small className="text-primary font-bold">
                {card.topic_name}
              </Small>
              <ExtraSmall className="text-primary">
                {card.language ? `Language: ${card.language}` : ""}
              </ExtraSmall>
            </div>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-1.5">
              <ExtraSmall className="font-bold text-primary">Goal</ExtraSmall>
            </div>
            {isEditing ? (
              <Textarea
                name="topic_goal"
                value={formData.topic_goal}
                onChange={handleChange}
                className="min-h-[80px] text-xs"
                placeholder="What is the goal of this topic?"
              />
            ) : (
              <ExtraSmall className="text-xs">{card.topic_goal}</ExtraSmall>
            )}
          </div>

          {card.topic_problem && <Separator className="my-3" />}

          {card.topic_problem && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <ExtraSmall className="font-bold text-primary">
                  Problem
                </ExtraSmall>
              </div>
              {isEditing ? (
                <Textarea
                  name="topic_problem"
                  value={formData.topic_problem}
                  onChange={handleChange}
                  className="min-h-[80px] text-xs"
                  placeholder="What problem are you trying to solve?"
                />
              ) : (
                <ExtraSmall className="text-xs">
                  {card.topic_problem}
                </ExtraSmall>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
