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
import { Target, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Small } from "@/components/ui/typography";
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

  // const handleSubmit = () => {
  //   if (onSubmit) {
  //     const updatedCard: TopicMessageCard = {
  //       ...card,
  //       ...formData,
  //     };
  //     onSubmit(updatedCard);
  //   }
  //   setIsEditing(false);
  // };

  return (
    <Card
      className={cn(
        "w-full mb-3 border border-primary/20 rounded-xl from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-sm transition-all duration-300 ease-in-out font-sans",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
    >
      <CardHeader className="px-4 rounded-t-xl">
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
              <div>
                <Small className="text-primary">
                  {card.language ? `Language: ${card.language}` : ""}
                </Small>
              </div>
            </div>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="=">
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Target className="text-primary h-4 w-4" />
              <Small className="font-bold text-primary">Goal</Small>
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
              <Small className="text-xs pl-5">{card.topic_goal}</Small>
            )}
          </div>

          <Separator className="my-3" />

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="text-primary h-4 w-4" />
              <Small className="font-bold text-primary">Problem</Small>
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
              <Small className="text-xs leading-relaxed pl-5">
                {card.topic_problem}
              </Small>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
