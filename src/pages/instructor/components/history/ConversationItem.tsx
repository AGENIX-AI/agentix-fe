import { memo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ExtraSmall } from "@/components/ui/typography";
import type { ConversationListItem } from "@/lib/utils/types/conversation";

interface ConversationItemProps {
  conversation: ConversationListItem;
  isSystemAssistant?: boolean;
  onClick: (conversation: ConversationListItem) => void;
}

// Parse MessageCard content to extract fields like topics, goals, etc.
const parseMessageCard = (content: string) => {
  if (!content || !content.startsWith("MessageCard")) return null;

  const result: Record<string, string> = {};

  // Extract fields using regex
  const fieldsRegex = /\|(\w+)=([^|]+)/g;
  let match;

  while ((match = fieldsRegex.exec(content)) !== null) {
    const [, key, value] = match;
    result[key] = value.trim();
  }

  return result;
};

function ConversationItemComponent({
  conversation,
  isSystemAssistant = false,
  onClick,
}: ConversationItemProps) {
  const lastMessageContent = conversation.last_message?.content || "";
  const messageCardData = parseMessageCard(lastMessageContent);

  // Determine what to display in the conversation item
  const displayContent = () => {
    if (messageCardData && messageCardData.topics) {
      return `Topic: ${messageCardData.topics}`;
    }

    return isSystemAssistant
      ? conversation.assistants?.tagline ||
          "Support you to use the App effectively"
      : `${
          conversation.last_message?.sender === "user" ? "You: " : ""
        }${lastMessageContent}`;
  };

  return (
    <div
      className={`flex items-center gap-3 py-2 cursor-pointer rounded-lg`}
      onClick={() => onClick(conversation)}
    >
      <Avatar className="overflow-hidden">
        <AvatarImage src={conversation.assistants?.image || ""} />
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">
            {conversation.assistants?.name || "Assistant"}
          </p>
        </div>
        <ExtraSmall className="truncate">{displayContent()}</ExtraSmall>
      </div>
    </div>
  );
}

export const ConversationItem = memo(ConversationItemComponent);
