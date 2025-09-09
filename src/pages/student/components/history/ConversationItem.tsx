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

  return (
    <div
      className={`flex items-center gap-2 py-1 cursor-pointer transition-all duration-200 rounded-2xl ${
        conversationId === conversation.id ? "bg-accent" : "hover:bg-accent/30 "
      }`}
      onClick={() => onClick(conversation)}
    >
      <div className="flex -space-x-2 ml-2">
        {avatarsToShow.map((p, idx) => (
          <Avatar
            key={`${p.id}-${idx}`}
            className="overflow-hidden h-5 w-5 ring-2 ring-background"
          >
            <AvatarImage src={p.image || ""} />
          </Avatar>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-xs">
            {isLearningTopic ? conversation.conversation_name : displayName}
          </p>
        </div>
      </div>
    </div>
  );
}
export const ConversationItem = memo(ConversationItemComponent);
