import { useState, useEffect, memo } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { useStudent } from "@/contexts/StudentContext";
import {
  getSystemAssistantConversation,
  createFirstConversation,
} from "@/api/conversations";
import type { SystemAssistantResponse } from "@/api/conversations";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import { ConversationItem } from "./ConversationItem";

function SystemAssistantBlockComponent({
  setIsChatLoading,
}: {
  setIsChatLoading: (isLoading: boolean) => void;
}) {
  const { setAssistantId, setConversationId, setRightPanel, isChatLoading } =
    useStudent();

  const [systemAssistant, setSystemAssistant] =
    useState<SystemAssistantResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSystemAssistant = async () => {
    try {
      setIsLoading(true);
      const response = await getSystemAssistantConversation();
      setSystemAssistant(response);
      setIsLoading(false);

      if (response.id) {
        setConversationId(response.id);
        setAssistantId(response.assistants?.id);
        setRightPanel("assistantTopics");
      } else {
        if (response.assistants?.id) {
          setIsChatLoading(true);
          const firstConversationResponse = await createFirstConversation(
            response.assistants.id
          );
          setConversationId(firstConversationResponse.conversation_id);
          setAssistantId(response.assistants.id);
          setRightPanel("assistantTopics");

          setIsChatLoading(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch system assistant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemAssistant();
  }, []);

  const handleSystemAssistantClick = async () => {
    if (isChatLoading) {
      return;
    }
    setIsChatLoading(true);
    console.log("handleSystemAssistantClick");
    if (systemAssistant?.id) {
      // If system assistant already has a conversation ID, use it
      setConversationId(systemAssistant.id);
      setAssistantId(systemAssistant.assistants?.id);
      setRightPanel("assistantTopics");
    } else if (systemAssistant?.assistants?.id) {
      console.log("createFirstConversation");
      // If no conversation ID exists, create a new one
      try {
        const response = await createFirstConversation(
          systemAssistant.assistants.id
        );
        setConversationId(response.conversation_id);
        setAssistantId(systemAssistant.assistants.id);
        setRightPanel("assistantTopics");
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    }
    setIsChatLoading(false);
  };

  if (isLoading) {
    return (
      <LoadingState
        message="Loading system assistant..."
        size="medium"
        className="h-16 mb-3"
      />
    );
  }

  if (!systemAssistant) {
    return null;
  }

  // Convert system assistant to conversation item format
  const systemAssistantConversation: ConversationListItem = {
    id: systemAssistant.id || "",
    assistants: systemAssistant.assistants,
    last_message: systemAssistant.last_message,
    conversation_name: systemAssistant.assistants?.name || "System Assistant",
    conversation_description:
      systemAssistant.assistants?.tagline ||
      "Support you to use the App effectively",
  };

  return (
    <div className="">
      <ConversationItem
        conversation={systemAssistantConversation}
        isSystemAssistant={true}
        onClick={handleSystemAssistantClick}
      />
    </div>
  );
}

export const SystemAssistantBlock = memo(SystemAssistantBlockComponent);
