import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useStudent } from "@/contexts/StudentContext";
import { UserConversationsBlock } from "./UserConversationsBlock";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import {
  BaseHistoryComponent,
  HistorySection,
} from "@/components/reused/history";
import { listConversations } from "@/api/conversations";

interface HistoryComponentProps {
  className?: string;
  isHistoryVisible?: boolean;
  toggleHistory?: () => void;
}

export function HistoryComponent({
  className,
  isHistoryVisible: propIsHistoryVisible,
  toggleHistory: propToggleHistory,
}: HistoryComponentProps) {
  const { t } = useTranslation();
  const { setIsChatLoading, workspaceId } = useStudent();
  const [searchQuery] = useState("");

  // Use props if provided, otherwise fall back to context
  const isHistoryVisible = propIsHistoryVisible;
  const toggleHistory = propToggleHistory;

  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const [dataFetched, setDataFetched] = useState(false);
  const [isChatsExpanded, setIsChatsExpanded] = useState(true);

  // Fetch data once when component mounts - NOT on every visibility change
  useEffect(() => {
    const fetchData = async () => {
      if (dataFetched) return;
      try {
        const json = await listConversations({
          workspace_id: workspaceId || "",
          page_number: 1,
          page_size: 100,
        });
        if (json && Array.isArray(json.conversations)) {
          setConversations(
            json.conversations.map(
              (c: any): ConversationListItem => ({
                id: c.id ?? null,
                assistants: c.assistants ?? null,
                participants: c.participants ?? [],
                conversation_name: c.title ?? null,
                conversation_description: c.conversation_description ?? "",
              })
            )
          );
        }
        setDataFetched(true);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [dataFetched]);

  const versionInfo = `v.${import.meta.env.VITE_APP_VERSION}.${
    import.meta.env.VITE_APP_LAST_BUILD_DATE
  }`;

  const collapsedContent = <div className="px-0" />;

  const expandedSections = (
    <>
      {/* <HistorySection
        title={t("student.history.chats")}
        isExpanded={isChatsExpanded}
        toggleExpanded={() => setIsChatsExpanded(!isChatsExpanded)}
      > */}
      <UserConversationsBlock
        searchQuery={searchQuery}
        setIsChatLoading={setIsChatLoading}
        conversationsData={conversations}
      />
      {/* </HistorySection> */}
    </>
  );

  return (
    <BaseHistoryComponent
      className={className}
      isHistoryVisible={isHistoryVisible}
      toggleHistory={toggleHistory}
      historyTitle="Chats"
      collapsedContent={collapsedContent}
      expandedSections={expandedSections}
      versionInfo={versionInfo}
    />
  );
}
