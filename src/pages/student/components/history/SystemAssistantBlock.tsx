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
import { useTranslation } from "react-i18next";

function SystemAssistantBlockComponent({
  setIsChatLoading,
  systemAssistantData,
}: {
  setIsChatLoading: (isLoading: boolean) => void;
  systemAssistantData?: SystemAssistantResponse | null;
}) {
  const { t } = useTranslation();
  const {
    setAssistantId,
    setConversationId,
    setRightPanel,
    isChatLoading,
    conversationId,
  } = useStudent();

  const [systemAssistant, setSystemAssistant] =
    useState<SystemAssistantResponse | null>(systemAssistantData || null);
  const [isLoading, setIsLoading] = useState(!systemAssistantData);

  const fetchSystemAssistant = async () => {
    try {
      setIsLoading(true);
      const response = await getSystemAssistantConversation();
      setSystemAssistant(response);
      setIsLoading(false);

      if (response.id) {
        setConversationId(response.id);
        setAssistantId(response.assistants?.id);
        setRightPanel("helps");
      } else {
        if (response.assistants?.id) {
          setIsChatLoading(true);
          const firstConversationResponse = await createFirstConversation(
            response.assistants.id
          );
          setConversationId(firstConversationResponse.conversation_id);
          setAssistantId(response.assistants.id);
          setRightPanel("helps");

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
    // Only fetch if data wasn't provided via props
    if (!systemAssistantData) {
      fetchSystemAssistant();
    }
  }, [systemAssistantData]);

  // Update local state when props change
  useEffect(() => {
    if (systemAssistantData) {
      setSystemAssistant(systemAssistantData);
      setIsLoading(false);
    }
  }, [systemAssistantData]);

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
      setRightPanel("helps");
    } else if (systemAssistant?.assistants?.id) {
      console.log("createFirstConversation");
      // If no conversation ID exists, create a new one
      try {
        const response = await createFirstConversation(
          systemAssistant.assistants.id
        );
        setConversationId(response.conversation_id);
        setAssistantId(systemAssistant.assistants.id);
        setRightPanel("helps");
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    }
    setIsChatLoading(false);
  };

  if (isLoading) {
    return (
      <LoadingState
        message={t("student.systemAssistant.loading")}
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
    conversation_name:
      systemAssistant.assistants?.name ||
      t("student.systemAssistant.defaultName"),
    conversation_description:
      systemAssistant.assistants?.tagline ||
      t("student.systemAssistant.defaultDescription"),
  };

  return (
    <div className="">
      <ConversationItem
        conversation={systemAssistantConversation}
        isSystemAssistant={true}
        conversationId={conversationId}
        onClick={handleSystemAssistantClick}
      />
    </div>
  );
}

export const SystemAssistantBlock = memo(SystemAssistantBlockComponent);
