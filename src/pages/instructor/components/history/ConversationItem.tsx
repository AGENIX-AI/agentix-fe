import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { ConversationListItem } from "@/lib/utils/types/conversation";

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
  // Determine if this item should be highlighted
  console.log("conversationId", conversationId);
  console.log("conversation.id", conversation.id);
  return (
    <div
      className={`flex items-center gap-2 py-1 cursor-pointer transition-all duration-200 rounded-2xl ${
        conversationId === conversation.id ? "bg-accent" : "hover:bg-accent/30 "
      }`}
      onClick={() => onClick(conversation)}
    >
      <Avatar className="overflow-hidden h-5 w-5 ml-2">
        <AvatarImage src={conversation.assistants?.image || ""} />
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-xs truncate">
            {isLearningTopic
              ? conversation.conversation_name
              : conversation.assistants?.name || t("history.assistant")}
          </p>
        </div>
      </div>
    </div>
  );
}

export const ConversationItem = memo(ConversationItemComponent);
