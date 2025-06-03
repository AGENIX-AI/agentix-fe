import { useState, useEffect, useRef, memo } from "react";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/ui/loading-state";
import { useStudent } from "@/contexts/StudentContext";
import { getListConversations } from "@/api/conversations";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import { eventBus } from "@/lib/utils/event/eventBus";
import { ConversationItem } from "./ConversationItem";

interface UserConversationsBlockProps {
  searchQuery: string;
  setIsChatLoading: (loading: boolean) => void;
}

function UserConversationsBlockComponent({
  searchQuery,
  setIsChatLoading,
}: UserConversationsBlockProps) {
  const {
    setAssistantId,
    setConversationId,
    setRightPanel,
    setChatPanel,
    isMessageLoading,
  } = useStudent();

  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const conversationsRef = useRef<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Display loading state for the history component
  const showLoadingState = isLoading && conversations.length === 0;

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await getListConversations();
      if (response.success) {
        setConversations(response.conversations);
        conversationsRef.current = response.conversations;
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch of conversations
  useEffect(() => {
    fetchConversations();
  }, []);

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
    return (
      (conversation.assistants?.name?.toLowerCase() || "").includes(query) ||
      (conversation.assistants?.tagline?.toLowerCase() || "").includes(query) ||
      (conversation.last_message?.content?.toLowerCase() || "").includes(query)
    );
  });

  const handleConversationClick = (conversation: ConversationListItem) => {
    // Prevent actions if messages are currently loading
    if (isMessageLoading) return;
    setIsChatLoading(true);
    // Set assistant ID from the conversation
    setAssistantId(conversation.assistants?.id);

    if (conversation) {
      // If this is an existing conversation with details
      setConversationId(conversation.id);
    } else {
      // Reset states for a new conversation
      setConversationId(null);
    }

    // Change the right panel to assistantTopics
    setRightPanel("assistantTopics");
    setChatPanel("chat");
    setIsChatLoading(false);
  };

  if (showLoadingState) {
    return (
      <LoadingState
        message="Loading conversations..."
        size="medium"
        className="h-32"
      />
    );
  }

  return (
    <div className="space-y-2">
      {filteredConversations.map(
        (conversation: ConversationListItem, index: number) => (
          <div key={conversation.id}>
            <ConversationItem
              conversation={conversation}
              onClick={handleConversationClick}
            />
            {index < filteredConversations.length - 1 && (
              <Separator orientation="horizontal" className="w-full my-1" />
            )}
          </div>
        )
      )}
    </div>
  );
}

export const UserConversationsBlock = memo(UserConversationsBlockComponent);
