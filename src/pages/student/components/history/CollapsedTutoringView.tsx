import { memo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { StudentConversationItem } from "@/api/conversations";

interface CollapsedTutoringViewProps {
  conversations: StudentConversationItem[];
  assistantId: string | null;
  handleTutoringClick: (conversation: StudentConversationItem) => void;
}

function CollapsedTutoringViewComponent({
  conversations,
  assistantId,
  handleTutoringClick,
}: CollapsedTutoringViewProps) {
  const { t } = useTranslation();
  if (conversations.length === 0) {
    return null;
  }

  return (
    <div>
      <ul className="">
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <button
              className={cn(
                "flex items-center w-full px-2 py-2 text-sm rounded-md cursor-pointer",
                "transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                "justify-center my-1"
              )}
              onClick={() => handleTutoringClick(conversation)}
            >
              <Avatar
                className={cn(
                  "h-5 w-5 cursor-pointer border overflow-hidden",
                  assistantId === conversation.assistants?.id
                    ? "border-primary"
                    : "border-accent"
                )}
              >
                <AvatarImage
                  src={conversation.assistants?.image || ""}
                  alt={t('student.collapsedTutoring.avatar')}
                />
              </Avatar>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const CollapsedTutoringView = memo(CollapsedTutoringViewComponent);
