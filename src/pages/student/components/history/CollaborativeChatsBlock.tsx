import { memo } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { SharedConversationItem } from "@/api/conversations";
import { useTranslation } from "react-i18next";

interface CollaborativeChatsBlockProps {
  sharedConversations: SharedConversationItem[];
  conversationId: string | null;
  setIsChatLoading: (loading: boolean) => void;
  onConversationClick: (conversation: SharedConversationItem) => void;
  searchQuery?: string;
}

function CollaborativeChatsBlockComponent({
  sharedConversations,
  conversationId,
  setIsChatLoading,
  onConversationClick,
  searchQuery = "",
}: CollaborativeChatsBlockProps) {
  const { t } = useTranslation();
  // Filter conversations if there's a search query
  const filteredConversations = searchQuery
    ? sharedConversations.filter(
        (conversation) =>
          conversation.conversation_info.conversation_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          conversation.conversation_info.conversation_description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          conversation.conversation_info.assistants?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          conversation.instructor_info?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : sharedConversations;

  if (filteredConversations.length === 0) {
    return (
      <div className="text-[10px] text-muted-foreground p-2">
        {t('student.collaborativeChats.noConversationsFound')}
      </div>
    );
  }

  return (
    <div className="mb-2 max-h-[300px] overflow-y-auto">
      <ul className="space-y-1">
        {filteredConversations.map((conversation) => (
          <li key={conversation.id}>
            <div
              className={`flex items-center gap-2 py-1 cursor-pointer transition-all duration-200 rounded-2xl ${
                conversationId === conversation.conversation_info.id
                  ? "bg-accent"
                  : "hover:bg-accent/30"
              }`}
              onClick={() => {
                setIsChatLoading(true);
                onConversationClick(conversation);
              }}
            >
              <div className="flex -space-x-2 ml-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={conversation.instructor_info?.avatar_url || ""}
                    alt={conversation.instructor_info?.name}
                  />
                </Avatar>
                <Avatar className="h-5 w-5">
                  <AvatarImage
                    src={conversation.conversation_info.assistants?.image || ""}
                    alt={conversation.conversation_info.assistants?.name}
                  />
                </Avatar>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs truncate">
                  {conversation.conversation_info.conversation_name ||
                    t('student.collaborativeChats.defaultChatName')}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const CollaborativeChatsBlock = memo(CollaborativeChatsBlockComponent);
