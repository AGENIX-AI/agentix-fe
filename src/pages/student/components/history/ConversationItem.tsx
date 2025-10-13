import { memo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import { useTranslation } from "react-i18next";

interface ConversationItemProps {
  conversation: ConversationListItem;
  isSystemAssistant?: boolean;
  onClick: (conversation: ConversationListItem) => void;
  conversationId?: string | null;
  isLearningTopic?: boolean;
}

function ConversationItemComponent({
  conversation,
  onClick,
  conversationId,
  isLearningTopic,
}: ConversationItemProps) {
  const { t } = useTranslation();

  const participants = conversation.participants || [];
  const assistantParticipant = participants.find((p) => p.kind === "assistant");
  const avatarsToShow =
    participants.length > 2
      ? participants.slice(0, 3)
      : assistantParticipant
      ? [assistantParticipant]
      : participants.slice(0, 1);

  const displayName =
    assistantParticipant?.name ||
    conversation.conversation_name ||
    t("student.conversationItem.assistant");

  const previewText =
    ((conversation as any).last_message?.content as string | undefined) ||
    conversation.conversation_description ||
    t("student.conversationItem.preview", {
      defaultValue: "Message content goes here...",
    });

  const timestamp = (conversation as any).last_message?.created_at || "12m";
  const unreadCount = (conversation as any).unread_count ?? 3;

  return (
    <div
      className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors rounded-lg border w-full min-w-0 ${
        conversationId === conversation.id
          ? "bg-accent/50 text-foreground border-border"
          : "bg-card text-card-foreground hover:bg-accent/30 border-border/60"
      } shadow-xs`}
      onClick={() => onClick(conversation)}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarsToShow[0]?.image || ""} />
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">
            {isLearningTopic ? conversation.conversation_name : displayName}
          </p>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
            {timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground truncate">
            {previewText}
          </p>
          <div
            className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] shrink-0"
            aria-label={`${unreadCount} unread messages`}
          >
            {unreadCount}
          </div>
        </div>
      </div>
    </div>
  );
}
export const ConversationItem = memo(ConversationItemComponent);
