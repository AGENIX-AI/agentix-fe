import { memo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ExtraSmall } from "@/components/ui/typography";
import type { ConversationListItem } from "@/lib/utils/types/conversation";

interface ConversationItemProps {
  conversation: ConversationListItem;
  isSystemAssistant?: boolean;
  onClick: (conversation: ConversationListItem) => void;
}

function ConversationItemComponent({
  conversation,
  isSystemAssistant = false,
  onClick,
}: ConversationItemProps) {
  return (
    <div
      className={`flex items-center gap-3 p-1 cursor-pointer rounded-lg`}
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
        <ExtraSmall className="truncate">
          {isSystemAssistant
            ? conversation.assistants?.tagline ||
              "Support you to use the App effectively"
            : `${conversation.last_message?.sender === "user" ? "You: " : ""}${
                conversation.last_message?.content || ""
              }`}
        </ExtraSmall>
      </div>
    </div>
  );
}

export const ConversationItem = memo(ConversationItemComponent);
