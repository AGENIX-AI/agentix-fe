import { useState, useEffect, useRef, memo } from "react";
import { useTranslation } from "react-i18next";
import { LoadingState } from "@/components/ui/loading-state";
import { useInstructor } from "@/contexts/InstructorContext";
import {
  createInstructorFirstConversation,
  getAssistantConversation,
} from "@/api/conversations";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import { eventBus } from "@/lib/utils/event/eventBus";
import { ConversationItem } from "./ConversationItem";

interface UserConversationsBlockProps {
  setIsChatLoading: (loading: boolean) => void;
  conversationsData: ConversationListItem[];
}

function UserConversationsBlockComponent({
  setIsChatLoading,
  conversationsData,
}: UserConversationsBlockProps) {
  const { t } = useTranslation();
  const {
    setAssistantId,
    setConversationId,
    setRightPanel,
    isChatLoading,
    metaData,
    setMetaData,
    conversationId,
  } = useInstructor();

  const [conversations, setConversations] = useState<ConversationListItem[]>(
    conversationsData || []
  );
  console.log(conversations);
  const conversationsRef = useRef<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Changed to false since data comes from props

  // Update local state when prop changes
  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
      conversationsRef.current = conversationsData;
      setIsLoading(false);
    }
  }, [conversationsData]);

  // Display loading state for the history component
  const showLoadingState = isLoading && conversations.length === 0;

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      console.log("fetchConversations");
      const response = await getAssistantConversation();
      setConversations(response.conversations);
      conversationsRef.current = response.conversations;
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleConversationClick = async (
    conversation: ConversationListItem
  ) => {
    // Prevent actions if messages are currently loading
    if (isChatLoading) {
      return;
    }
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
          // This is more efficient than calling fetchConversations() directly
          eventBus.emit("reload-history", {
            assistantId: conversation.assistants.id,
            conversationId: response.conversation_id,
          });
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
    setMetaData({
      ...metaData,
      assistantId: conversation.assistants?.id,
    });
    setRightPanel("assistant-dashboard");
    setIsChatLoading(false);
  };

  if (showLoadingState) {
    return (
      <LoadingState
        message={t("history.loadingConversations")}
        size="medium"
        className="h-32"
      />
    );
  }

  return (
    <div className="">
      {conversations.map((conversation: ConversationListItem) => (
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
