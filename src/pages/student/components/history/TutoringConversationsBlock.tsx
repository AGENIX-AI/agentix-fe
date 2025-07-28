import { memo } from "react";
import type { StudentConversationItem } from "@/api/conversations";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";

interface TutoringConversationsBlockProps {
  tutoringConversations: StudentConversationItem[];
  conversationId: string | null;
  setIsChatLoading: (loading: boolean) => void;
  onConversationClick: (conversation: StudentConversationItem) => void;
  searchQuery?: string;
}

function TutoringConversationsBlockComponent({
  tutoringConversations,
  conversationId,
  setIsChatLoading,
  onConversationClick,
  searchQuery = "",
}: TutoringConversationsBlockProps) {
  const { t } = useTranslation();
  // Filter conversations if there's a search query
  const filteredConversations = searchQuery
    ? tutoringConversations.filter(
        (conversation) =>
          conversation.conversation_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          conversation.conversation_description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          conversation.assistants?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : tutoringConversations;

  if (filteredConversations.length === 0) {
    return (
      <div className="text-[10px] text-muted-foreground p-2">
        {t('student.tutoringConversations.noConversationsFound')}
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
                conversationId === conversation.id
                  ? "bg-accent"
                  : "hover:bg-accent/30"
              }`}
              onClick={() => {
                setIsChatLoading(true);
                onConversationClick(conversation);
              }}
            >
              <Avatar className="overflow-hidden h-5 w-5 ml-2">
                <AvatarImage src={conversation.assistants?.image || ""} />
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs truncate">
                  {conversation.conversation_name || t('student.tutoringConversation.defaultName')}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const TutoringConversationsBlock = memo(
  TutoringConversationsBlockComponent
);
