import { memo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  if (conversations.length === 0) {
    return null;
  }

  return (
    <div>
      <ul className="flex flex-col items-center space-y-2">
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <button
              className="p-0"
              onClick={() => handleTutoringClick(conversation)}
            >
              <Avatar
                className={cn(
                  "h-8 w-8 cursor-pointer border overflow-hidden",
                  assistantId === conversation.assistants?.id
                    ? "border-primary"
                    : "border-accent"
                )}
              >
                <AvatarImage
                  src={conversation.assistants?.image || ""}
                  alt="Avatar"
                />
              </Avatar>
            </button>
            <Tooltip>
              <TooltipTrigger>
                <span className="sr-only">{conversation.conversation_name}</span>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[200px]">
                <p className="font-medium truncate max-w-[180px]">{conversation.conversation_name}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {conversation.conversation_description}
                </p>
              </TooltipContent>
            </Tooltip>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const CollapsedTutoringView = memo(CollapsedTutoringViewComponent);
