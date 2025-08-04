import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { useStudent } from "@/contexts/StudentContext";
import { SystemAssistantBlock } from "./SystemAssistantBlock";
import { UserConversationsBlock } from "./UserConversationsBlock";
import { TutoringConversationsBlock } from "./TutoringConversationsBlock";
import { CollapsedTutoringView } from "./CollapsedTutoringView";
import { CollaborativeChatsBlock } from "./CollaborativeChatsBlock";
import { CollapsedCollaborativeView } from "./CollapsedCollaborativeView";
import { Separator } from "@/components/ui/separator";
import {
  getSystemAssistantConversation,
  getListConversations,
  getStudentLastConversations,
  getStudentSharedConversations,
  createFirstConversation,
} from "@/api/conversations";
import type {
  StudentConversationItem,
  SharedConversationItem,
} from "@/api/conversations";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import type { SystemAssistantResponse } from "@/api/conversations";
import {
  BaseHistoryComponent,
  HistorySection,
  HistoryAvatar,
} from "@/components/reused/history";

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
  const {
    setIsChatLoading,
    setAssistantId,
    setConversationId,
    setRightPanel,
    isChatLoading,
    assistantId,
    conversationId,
  } = useStudent();
  const [searchQuery] = useState("");

  // Use props if provided, otherwise fall back to context
  const isHistoryVisible = propIsHistoryVisible;
  const toggleHistory = propToggleHistory;

  // State for collapsed view avatars
  const [systemAssistant, setSystemAssistant] =
    useState<SystemAssistantResponse | null>(null);
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const [tutoringConversations, setTutoringConversations] = useState<
    StudentConversationItem[]
  >([]);
  const [sharedConversations, setSharedConversations] = useState<
    SharedConversationItem[]
  >([]);
  const [dataFetched, setDataFetched] = useState(false);

  // State for section visibility
  const [isChatsExpanded, setIsChatsExpanded] = useState(true);
  const [isTutoringExpanded, setIsTutoringExpanded] = useState(true);
  const [isCollaborativeExpanded, setIsCollaborativeExpanded] = useState(true);

  // Fetch data once when component mounts - NOT on every visibility change
  useEffect(() => {
    const fetchData = async () => {
      if (dataFetched) return;
      try {
        const [
          systemResponse,
          conversationsResponse,
          tutoringResponse,
          sharedResponse,
        ] = await Promise.all([
          getSystemAssistantConversation(),
          getListConversations(),
          getStudentLastConversations(1, 100, 1),
          getStudentSharedConversations(),
        ]);

        setSystemAssistant(systemResponse);

        if (conversationsResponse.success) {
          setConversations(conversationsResponse.conversations);
        }

        if (tutoringResponse && tutoringResponse.success) {
          setTutoringConversations(tutoringResponse.conversations);
        }

        if (sharedResponse?.success) {
          setSharedConversations(sharedResponse.conversations);
        }

        setDataFetched(true);

        if (systemResponse.id && !conversationId) {
          setConversationId(systemResponse.id);
          setAssistantId(systemResponse.assistants?.id);
          setRightPanel("helps");
        } else if (systemResponse.assistants?.id && !conversationId) {
          setIsChatLoading(true);
          const firstConversationResponse = await createFirstConversation(
            systemResponse.assistants.id
          );
          setConversationId(firstConversationResponse.conversation_id);
          setAssistantId(systemResponse.assistants.id);
          setRightPanel("helps");

          setIsChatLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [dataFetched]);

  // Handle avatar click in collapsed view - DON'T auto-expand
  const handleAvatarClick = async (
    conversation:
      | ConversationListItem
      | SystemAssistantResponse
      | StudentConversationItem
      | SharedConversationItem,
    isSystem = false,
    isTutoring = false,
    isCollaborative = false
  ) => {
    if (isChatLoading) return;
    setIsChatLoading(true);

    if (isSystem && systemAssistant) {
      setAssistantId(systemAssistant.assistants?.id || "");
      setConversationId(systemAssistant.id || "");
      setRightPanel("topics");
    } else if (isTutoring) {
      const tutoring = conversation as StudentConversationItem;
      setAssistantId(tutoring.assistants?.id || "");
      setConversationId(tutoring.id || "");
      setRightPanel("tasks");
    } else if (isCollaborative) {
      const collaborative = conversation as SharedConversationItem;
      setAssistantId(collaborative.conversation_info.assistants?.id || "");
      setConversationId(collaborative.conversation_info.id || "");
      setRightPanel("tasks");
    }
    // Set loading state back to false after handling click
    setIsChatLoading(false);
  };

  // Handler for tutoring conversation clicks
  const handleTutoringClick = (conversation: StudentConversationItem) => {
    handleAvatarClick(conversation, false, true, false);
  };

  const handleCollaborativeClick = (conversation: SharedConversationItem) => {
    handleAvatarClick(conversation, false, false, true);
  };

  // Generate version info string
  const versionInfo = `v.${import.meta.env.VITE_APP_VERSION}.${
    import.meta.env.VITE_APP_LAST_BUILD_DATE
  }`;

  // Collapsed content for BaseHistoryComponent
  const collapsedContent = (
    <div className="px-0">
      <div className="flex flex-col">
        {/* Assistants section - only show if has system assistant or conversations */}
        {(systemAssistant?.assistants?.image || conversations.length > 0) && (
          <div>
            <div
              className={cn(
                "flex items-center w-full px-2 py-2 text-sm rounded-md cursor-pointer",
                "transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                "justify-center"
              )}
            >
              {/* System Assistant */}
              {systemAssistant?.assistants?.image && (
                <HistoryAvatar
                  imageSrc={systemAssistant.assistants.image || ""}
                  isActive={assistantId === systemAssistant.assistants.id}
                  onClick={() => handleAvatarClick(systemAssistant, true)}
                />
              )}
            </div>
          </div>
        )}

        <div
          className="overflow-y-auto no-scrollbar"
          style={{ maxHeight: "calc(100vh - 200px)" }}
        >
          {/* Regular conversations - only show if has conversations */}
          {conversations.length > 0 && (
            <div className="">
              <ul className="flex flex-col items-center space-y-1">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <button
                      className={cn(
                        "flex items-center w-full px-2 py-2 text-sm rounded-md cursor-pointer",
                        "transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                        "justify-center my-1"
                      )}
                      onClick={() => handleAvatarClick(conversation)}
                    >
                      <HistoryAvatar
                        imageSrc={conversation.assistants?.image || ""}
                        isActive={assistantId === conversation.assistants?.id}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Separator between sections - only show if there are sections above and below */}
          {(systemAssistant?.assistants?.image || conversations.length > 0) &&
            tutoringConversations.length > 0 && <Separator />}

          {/* Tutoring conversations - only show if has tutoring conversations */}
          {tutoringConversations.length > 0 && (
            <CollapsedTutoringView
              conversations={tutoringConversations}
              assistantId={assistantId}
              handleTutoringClick={handleTutoringClick}
            />
          )}

          {/* Separator between sections - only show if there are sections above and below */}
          {tutoringConversations.length > 0 &&
            sharedConversations.length > 0 && <Separator />}

          {/* Collaborative chats - only show if has shared conversations */}
          {sharedConversations.length > 0 && (
            <CollapsedCollaborativeView
              conversations={sharedConversations}
              conversationId={conversationId}
              handleCollaborativeClick={handleCollaborativeClick}
            />
          )}
        </div>
      </div>
    </div>
  );

  // Expanded sections for BaseHistoryComponent
  const expandedSections = (
    <>
      {/* ZONE 1: Assistants - only show if has system assistant or conversations */}
      {(systemAssistant || conversations.length > 0) && (
        <HistorySection
          title="Chats with Assistants"
          isExpanded={isChatsExpanded}
          toggleExpanded={() => setIsChatsExpanded(!isChatsExpanded)}
        >
          {/* BLOCK 1: System Assistant */}
          <SystemAssistantBlock
            setIsChatLoading={setIsChatLoading}
            systemAssistantData={systemAssistant}
          />

          {/* BLOCK 2: User Conversations */}
          <UserConversationsBlock
            searchQuery={searchQuery}
            setIsChatLoading={setIsChatLoading}
            conversationsData={conversations}
          />
        </HistorySection>
      )}

      {/* ZONE 2: Tutoring - only show if has tutoring conversations */}
      {tutoringConversations.length > 0 && (
        <HistorySection
          title={t("student.history.privateTopics")}
          isExpanded={isTutoringExpanded}
          toggleExpanded={() => setIsTutoringExpanded(!isTutoringExpanded)}
        >
          <TutoringConversationsBlock
            tutoringConversations={tutoringConversations}
            conversationId={conversationId}
            setIsChatLoading={setIsChatLoading}
            onConversationClick={handleTutoringClick}
            searchQuery={searchQuery}
          />
        </HistorySection>
      )}

      {/* ZONE 3: Collaborative Chats - only show if has shared conversations */}
      {sharedConversations.length > 0 && (
        <HistorySection
          title={t("student.history.collaborativeChats")}
          isExpanded={isCollaborativeExpanded}
          toggleExpanded={() =>
            setIsCollaborativeExpanded(!isCollaborativeExpanded)
          }
        >
          <CollaborativeChatsBlock
            sharedConversations={sharedConversations}
            conversationId={conversationId}
            setIsChatLoading={setIsChatLoading}
            onConversationClick={handleCollaborativeClick}
            searchQuery={searchQuery}
          />
        </HistorySection>
      )}
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
