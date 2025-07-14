import { useState, useEffect, memo } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { useInstructor } from "@/contexts/InstructorContext";
import { createInstructorFirstConversation } from "@/api/conversations";
import type { SystemAssistantResponse } from "@/api/conversations";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import { ConversationItem } from "./ConversationItem";

function SystemAssistantBlockComponent({
  setIsChatLoading,
  systemAssistantData,
}: {
  setIsChatLoading: (isLoading: boolean) => void;
  systemAssistantData: SystemAssistantResponse | null;
}) {
  const { setAssistantId, setConversationId, setRightPanel, isChatLoading } =
    useInstructor();

  const [systemAssistant, setSystemAssistant] =
    useState<SystemAssistantResponse | null>(systemAssistantData);
  const [isLoading, setIsLoading] = useState(!systemAssistantData);

  // Update local state when prop changes
  useEffect(() => {
    if (systemAssistantData) {
      setSystemAssistant(systemAssistantData);
      setIsLoading(false);
    }
  }, [systemAssistantData]);

  // Remove the fetchSystemAssistant function and its useEffect since data should come from props

  const handleSystemAssistantClick = async () => {
    if (isChatLoading) {
      return;
    }
    setIsChatLoading(true);
    if (systemAssistant?.id) {
      // If system assistant already has a conversation ID, use it
      setConversationId(systemAssistant.id);
      setAssistantId(systemAssistant.assistants?.id);
      setRightPanel("assistantTopics");
    } else if (systemAssistant?.assistants?.id) {
      // If no conversation ID exists, create a new one
      try {
        const response = await createInstructorFirstConversation(
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
        className="h-16 mb-4"
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
    conversation_name: systemAssistant.assistants.name || "System Assistant",
    conversation_description:
      systemAssistant.assistants.tagline ||
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
