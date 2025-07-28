import { memo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { SharedConversationItem } from "@/api/conversations";
import { useTranslation } from "react-i18next";

interface CollapsedCollaborativeViewProps {
  conversations: SharedConversationItem[];
  conversationId: string | null;
  handleCollaborativeClick: (conversation: SharedConversationItem) => void;
}

function CollapsedCollaborativeViewComponent({
  conversations,
  conversationId,
  handleCollaborativeClick,
}: CollapsedCollaborativeViewProps) {
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
              onClick={() => handleCollaborativeClick(conversation)}
            >
              <div className="relative flex items-center justify-center h-8 w-8">
                <Avatar
                  className={cn(
                    "h-5 w-5 absolute left-0 bottom-0 cursor-pointer border overflow-hidden",
                    conversationId === conversation.id
                      ? "border-primary"
                      : "border-accent"
                  )}
                >
                  <AvatarImage
                    src={conversation.instructor_info?.avatar_url || ""}
                    alt={conversation.instructor_info?.name}
                  />
                </Avatar>
                <Avatar
                  className={cn(
                    "h-5 w-5 absolute right-0 top-0 cursor-pointer border overflow-hidden",
                    conversationId === conversation.id
                      ? "border-primary"
                      : "border-accent"
                  )}
                >
                  <AvatarImage
                    src={conversation.conversation_info.assistants?.image || ""}
                    alt={t('student.collapsedCollaborative.assistant')}
                  />
                </Avatar>
              </div>
            </button>

            <Tooltip>
              <TooltipTrigger>
                <span className="sr-only">
                  {conversation.conversation_info.conversation_name}
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[200px]">
                <p className="font-medium truncate max-w-[180px]">
                  {conversation.conversation_info.conversation_name}
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {t('student.collapsedCollaborative.with')} {conversation.instructor_info?.name}
                </p>
              </TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const CollapsedCollaborativeView = memo(
  CollapsedCollaborativeViewComponent
);
