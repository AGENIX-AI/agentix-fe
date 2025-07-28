import { memo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { StudentConversationItem } from "@/api/conversations";
import { useTranslation } from "react-i18next";

interface TutoringConversationItemProps {
  conversation: StudentConversationItem;
  onClick: (conversation: StudentConversationItem) => void;
  assistantId: string | null;
}

function TutoringConversationItemComponent({
  conversation,
  onClick,
  assistantId,
}: TutoringConversationItemProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`flex items-center gap-2 py-1 cursor-pointer transition-all duration-200 rounded-2xl ${
        assistantId === conversation.assistants?.id
          ? "bg-accent"
          : "hover:bg-accent/30 "
      }`}
      onClick={() => onClick(conversation)}
    >
      <Avatar className="overflow-hidden h-5 w-5 ml-2">
        <AvatarImage src={conversation.assistants?.image || ""} />
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs">
          {conversation.conversation_name ||
            t("student.tutoringConversation.defaultName")}
        </p>
        <p className="text-[10px] text-muted-foreground truncate pr-1">
          {conversation.conversation_description}
        </p>
      </div>
    </div>
  );
}

export const TutoringConversationItem = memo(TutoringConversationItemComponent);
