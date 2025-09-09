import { useState, useEffect, useRef, memo } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { useStudent } from "@/contexts/StudentContext";
import { listConversations, getConversationHistory } from "@/api/conversations";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import { eventBus } from "@/lib/utils/event/eventBus";
import { ConversationItem } from "./ConversationItem";
import { useTranslation } from "react-i18next";

interface UserConversationsBlockProps {
  searchQuery: string;
  setIsChatLoading: (loading: boolean) => void;
  conversationsData?: ConversationListItem[];
}

function UserConversationsBlockComponent({
  searchQuery,
  setIsChatLoading,
  conversationsData,
}: UserConversationsBlockProps) {
  const { t } = useTranslation();
  const {
    setAssistantId,
    setConversationId,
    setRightPanel,
    conversationId,
    isChatLoading,
    workspaceId,
  } = useStudent();

  const [conversations, setConversations] = useState<ConversationListItem[]>(
    conversationsData || []
  );
  const conversationsRef = useRef<ConversationListItem[]>(
    conversationsData || []
  );
  const [isLoading, setIsLoading] = useState(!conversationsData);

  // Display loading state for the history component
  const showLoadingState = isLoading && conversations.length === 0;

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const resp = await listConversations({
        workspace_id: workspaceId || "",
        page_number: 1,
        page_size: 100,
      });
      const items: ConversationListItem[] = (resp.conversations || []).map(
        (c: any) => ({
          id: c.id ?? null,
          assistants: c.assistants ?? null,
          participants: c.participants ?? [],
          conversation_name: c.title ?? null,
          conversation_description: c.conversation_description ?? "",
        })
      );
      setConversations(items);
      conversationsRef.current = items;
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch of conversations - only if data not provided via props
  useEffect(() => {
    if (!conversationsData) {
      fetchConversations();
    }
  }, [conversationsData]);

  // Update local state when props change
  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
      conversationsRef.current = conversationsData;
      setIsLoading(false);
    }
  }, [conversationsData]);

  // Listen for conversation updates
  useEffect(() => {
    const conversationUpdateUnsubscribe = eventBus.on(
      "conversation-update",
      (data) => {
        console.log(
          "UserConversationsBlock received conversation-update event:",
          data
        );

        setConversations((prevConversations) => {
          // Find the conversation that was updated by conversationId
          const updatedConversationIndex = prevConversations.findIndex(
            (conversation) => conversation.id === data.conversationId
          );

          if (updatedConversationIndex === -1) {
            return prevConversations;
          }

          // Create a new array with the updated conversation
          const newConversations = [...prevConversations];

          // Update the conversation with new last_message
          const updatedConversation = {
            ...newConversations[updatedConversationIndex],
            last_message: data.lastMessage,
          };

          // Remove the conversation from its current position
          newConversations.splice(updatedConversationIndex, 1);

          // Add it to the beginning of the array (move to top)
          newConversations.unshift(updatedConversation);

          return newConversations;
        });

        // Also update the reference
        const updatedConversationIndex = conversationsRef.current.findIndex(
          (conversation) => conversation.id === data.conversationId
        );

        if (updatedConversationIndex !== -1) {
          const updatedConversation = {
            ...conversationsRef.current[updatedConversationIndex],
            last_message: data.lastMessage,
          };

          conversationsRef.current.splice(updatedConversationIndex, 1);
          conversationsRef.current.unshift(updatedConversation);
        }
      }
    );

    // Listen for reload-history event to refresh the conversation list
    const reloadHistoryUnsubscribe = eventBus.on("reload-history", (data) => {
      console.log(
        "UserConversationsBlock received reload-history event:",
        data
      );

      // Fetch conversations to refresh the list
      fetchConversations();
    });

    return () => {
      conversationUpdateUnsubscribe();
      reloadHistoryUnsubscribe();
    };
  }, []);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const assistantName = (
      (conversation as any).assistants?.name || ""
    ).toLowerCase();
    const participantsMatch = (conversation as any).participants?.some(
      (p: any) => (p.name || "").toLowerCase().includes(query)
    );
    return (
      (conversation.conversation_name?.toLowerCase() || "").includes(query) ||
      assistantName.includes(query) ||
      !!participantsMatch ||
      (conversation.last_message?.content?.toLowerCase() || "").includes(query)
    );
  });

  const handleConversationClick = async (
    conversation: ConversationListItem
  ) => {
    // Prevent actions if messages are currently loading
    if (isChatLoading) {
      return;
    }
    setIsChatLoading(true);

    if (conversation.assistants && (conversation.assistants as any).id) {
      setAssistantId((conversation.assistants as any).id);
    }

    if (conversation) {
      setConversationId(conversation.id);
    } else {
      setConversationId(null);
    }

    try {
      if (conversation.id) {
        const history = await getConversationHistory(conversation.id);
        eventBus.emit("conversation-history", {
          conversationId: conversation.id,
          messages: history.messages || [],
        });
      }
    } catch (e) {
      console.error("Failed to load conversation history", e);
    }

    setRightPanel("assistantTopics");
    setIsChatLoading(false);
  };

  if (showLoadingState) {
    return (
      <LoadingState
        message={t("student.userConversations.loadingConversations")}
        size="medium"
        className="h-32"
      />
    );
  }

  return (
    <div className="">
      {filteredConversations.map((conversation: ConversationListItem) => (
        <div key={conversation.id}>
          <ConversationItem
            conversation={conversation}
            onClick={handleConversationClick}
            conversationId={conversationId}
          />
        </div>
      ))}
    </div>
  );
}

export const UserConversationsBlock = memo(UserConversationsBlockComponent);
