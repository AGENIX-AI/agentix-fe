import { useState, useEffect, useRef, memo } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { useInstructor } from "@/contexts/InstructorContext";
import {
  getInstructorListConversations,
  createInstructorFirstConversation,
} from "@/api/conversations";
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
  } = useInstructor();

  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const conversationsRef = useRef<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 100;

  // Display loading state for the history component
  const showLoadingState = isLoading && conversations.length === 0;

  const fetchConversations = async (search?: string, page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await getInstructorListConversations(
        page,
        pageSize,
        "created_at",
        1,
        search
      );
      if (response.success) {
        setConversations(response.conversations);
        conversationsRef.current = response.conversations;
        setCurrentPage(response.page_number);
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

  // Handle search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchConversations(searchQuery, 1);
    }, 300); // Debounce search requests

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
      fetchConversations(searchQuery, currentPage);
    });

    return () => {
      conversationUpdateUnsubscribe();
      reloadHistoryUnsubscribe();
    };
  }, [searchQuery, currentPage]);

  const handleConversationClick = async (
    conversation: ConversationListItem
  ) => {
    // Prevent actions if messages are currently loading
    if (isMessageLoading) return;
    setIsChatLoading(true);

    // Set assistant ID from the conversation
    setAssistantId(conversation.assistants?.id);
    console.log(conversation);
    if (conversation && conversation.id) {
      // If this is an existing conversation with details
      setConversationId(conversation.id);
    } else {
      // Create a new conversation if no conversation ID exists
      try {
        console.log("fetch new conversation");
        console.log(conversation);
        if (conversation.assistants?.id) {
          const response = await createInstructorFirstConversation(
            conversation.assistants.id
          );
          console.log(
            "Conversation created with ID:",
            response.conversation_id
          );
          setConversationId(response.conversation_id);

          // Emit reload-history event to refresh the conversation list
          // eventBus.emit("reload-history", {
          //   assistantId: conversation.assistants.id,
          //   conversationId: response.conversation_id,
          // });
          fetchConversations();
        } else {
          // Reset states for a new conversation
          setConversationId(null);
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
        setConversationId(null);
      }
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
      {conversations.map((conversation: ConversationListItem) => (
        <div key={conversation.id}>
          <ConversationItem
            conversation={conversation}
            onClick={handleConversationClick}
          />
        </div>
      ))}
    </div>
  );
}

export const UserConversationsBlock = memo(UserConversationsBlockComponent);
