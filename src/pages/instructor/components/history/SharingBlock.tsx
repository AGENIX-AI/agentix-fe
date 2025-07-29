import { useState, useEffect, memo } from "react";
import { useTranslation } from "react-i18next";
import { LoadingState } from "@/components/ui/loading-state";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getInstructorSharedConversations } from "@/api/conversations";
import type { InstructorSharedConversationItem } from "@/api/conversations";
import { useInstructor } from "@/contexts/InstructorContext";

interface SharingBlockProps {
  searchQuery: string;
  sharingData?: InstructorSharedConversationItem[];
}

function SharingBlockComponent({
  searchQuery,
  sharingData,
}: SharingBlockProps) {
  const { t } = useTranslation();
  const [sharedConversations, setSharedConversations] = useState<
    InstructorSharedConversationItem[]
  >(sharingData || []);
  const [isLoading, setIsLoading] = useState(!sharingData);
  const { setRightPanel, setConversationId, setAssistantId, conversationId } =
    useInstructor();

  // Update local state when prop changes
  useEffect(() => {
    if (sharingData) {
      setSharedConversations(sharingData);
      setIsLoading(false);
    }
  }, [sharingData]);

  const fetchSharingData = async () => {
    try {
      setIsLoading(true);
      const response = await getInstructorSharedConversations();
      if (response.success) {
        setSharedConversations(response.conversations);
      }
    } catch (error) {
      console.error("Failed to fetch shared conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Only fetch if no data provided via props
  useEffect(() => {
    if (!sharingData) {
      fetchSharingData();
    }
  }, [sharingData]);

  // Filter shared conversations based on search query
  const filteredConversations = sharedConversations.filter((conversation) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const studentName = conversation.student_info.name.toLowerCase();
    const studentEmail = conversation.student_info.email.toLowerCase();
    const conversationName =
      conversation.conversation_info?.conversation_name?.toLowerCase() || "";

    return (
      studentName.includes(query) ||
      studentEmail.includes(query) ||
      conversationName.includes(query)
    );
  });

  const handleSharingClick = (
    conversation: InstructorSharedConversationItem
  ) => {
    setConversationId(conversation.conversation_info?.id || null);
    setAssistantId(conversation.conversation_info?.assistants?.id || null);
    setRightPanel("tasks");
  };

  if (isLoading) {
    return (
      <LoadingState
        message={t("history.loadingSharing")}
        size="medium"
        className="h-32"
      />
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4 text-[10px]">
        {searchQuery
          ? t("history.noCollaborativeTopicsFound")
          : t("history.noCollaborativeTopicsAvailable")}
      </div>
    );
  }

  return (
    <div className="mb-2 max-h-[300px] overflow-y-auto">
      <ul className="space-y-1">
        {filteredConversations.map(
          (conversation: InstructorSharedConversationItem) => (
            <li key={conversation.id}>
              <div
                className={`flex items-center gap-2 py-1 cursor-pointer transition-all duration-200 rounded-2xl ${
                  conversationId === conversation.conversation_info?.id
                    ? "bg-accent"
                    : "hover:bg-accent/30"
                }`}
                onClick={() => handleSharingClick(conversation)}
              >
                <div className="flex -space-x-2 ml-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={conversation.student_info.avatar_url || ""}
                      alt={conversation.student_info.name}
                    />
                  </Avatar>
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={
                        conversation.conversation_info?.assistants?.image || ""
                      }
                      alt="Assistant"
                    />
                  </Avatar>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs truncate">
                    {conversation.conversation_info?.conversation_name ||
                      t("history.collaborativeTopic")}
                  </p>
                </div>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export const SharingBlock = memo(SharingBlockComponent);
