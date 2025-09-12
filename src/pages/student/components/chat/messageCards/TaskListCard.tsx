import { Button } from "@/components/ui/button";
import { Small, Muted, ExtraSmall } from "@/components/ui/typography";
import { CheckCircle2, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useChatContext } from "@/contexts/ChatContext";
import { acceptTasks } from "@/api/conversations";
import { useStudent } from "@/contexts/StudentContext";
import type { TaskListCard } from "./types";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TaskListCardProps {
  card: TaskListCard;
  className?: string;
}

export function TaskListCardView({ card, className }: TaskListCardProps) {
  const { t } = useTranslation();
  const { handleSendMessage } = useChatContext();
  const { conversationId } = useStudent();

  const onAccept = async () => {
    try {
      if (!conversationId) return;
      // We need a message_id to pass; since cards come as messages, we cannot access it here directly.
      // As a minimal approach, send only the message, and backend can link by latest task_list message in conversation.
      const ack = t("chat.tasks.accept_message", "Accepted the task list");
      await handleSendMessage(ack);
      await acceptTasks({
        conversation_id: conversationId,
        message_id: "latest", // backend can resolve the latest task_list message in this conversation
        tasks: card.tasks,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const title = card.title || t("chat.tasks.title", "Planned Tasks");

  return (
    <div
      className={cn(
        "w-full max-w-none self-stretch border border-border rounded-xl bg-card shadow-sm transition-all duration-300 ease-in-out font-sans",
        className
      )}
      style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)" } as React.CSSProperties}
    >
      {/* Header */}
      <div className="rounded-t-xl p-3 pb-0">
        <div className="flex flex-col space-y-1">
          <Small className="text-primary font-bold gap-3">{title}</Small>
        </div>
        <Separator className="my-3" />
      </div>

      {/* Content */}
      <div className="p-3 pt-0">
        <div className="space-y-2">
          {Array.isArray(card.tasks) && card.tasks.length > 0 ? (
            card.tasks.map((task, idx) => {
              const isString = typeof task === "string";
              const taskTitle = isString ? task : task.title;
              const desc = isString ? undefined : task.description;
              const done = isString ? false : Boolean((task as any).done);
              return (
                <div
                  key={(isString ? idx : (task as any).id) ?? idx}
                  className="flex items-start gap-2"
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground mt-0.5" />
                  )}
                  <div className="flex-1">
                    <ExtraSmall className="text-xs text-foreground font-medium">
                      {taskTitle || t("chat.tasks.untitled", "Untitled task")}
                    </ExtraSmall>
                    {desc && (
                      <Muted className="block text-[11px] leading-snug">
                        {desc}
                      </Muted>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <Muted>{t("chat.tasks.empty", "No tasks provided")}</Muted>
          )}
        </div>
        <Separator className="mt-3" />
      </div>

      {/* Footer */}
      <div className="px-3 pb-3">
        <Button
          variant="default"
          size="sm"
          onClick={onAccept}
          className="w-full text-xs"
        >
          {t("chat.tasks.accept", "Accept Tasks")}
        </Button>
      </div>
    </div>
  );
}
