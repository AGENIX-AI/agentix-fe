import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SystemAssistantBlock } from "./SystemAssistantBlock";
import { UserConversationsBlock } from "./UserConversationsBlock";
import { SharingBlock } from "./SharingBlock";
import { LearningTopicBlock } from "./LearningTopicBlock";
import { Separator } from "@/components/ui/separator";
import {
  getSystemAssistantConversation,
  createFirstConversation,
  getInstructorSharedConversations,
  getInstructorListConversations,
  getAssistantConversation,
} from "@/api/conversations";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import type {
  SystemAssistantResponse,
  InstructorSharedConversationItem,
} from "@/api/conversations";
import { useInstructor } from "@/contexts/InstructorContext";
import { t } from "i18next";
import {
  BaseHistoryComponent,
  HistorySection,
  HistoryAvatar,
  DualAvatar,
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
  const {
    setIsChatLoading,
    setAssistantId,
    setConversationId,
    setRightPanel,
    isChatLoading,
    assistantId,
    conversationId,
    metaData,
    setMetaData,
  } = useInstructor();
  const [searchQuery] = useState("");

  // Use props if provided, otherwise fall back to context
  const isHistoryVisible = propIsHistoryVisible;
  const toggleHistory = propToggleHistory;

  // State for section visibility
  const [isChatsExpanded, setIsChatsExpanded] = useState(true);
  const [isSharingExpanded, setIsSharingExpanded] = useState(true);
  const [isLearningTopicsExpanded, setIsLearningTopicsExpanded] =
    useState(true);

  // State for collapsed view avatars
  const [systemAssistant, setSystemAssistant] =
    useState<SystemAssistantResponse | null>(null);
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const [sharedConversations, setSharedConversations] = useState<
    InstructorSharedConversationItem[]
  >([]);
  const [learningTopics, setLearningTopics] = useState<ConversationListItem[]>(
    []
  );
  const [dataFetched, setDataFetched] = useState(false);

  // Fetch data once when component mounts - NOT on every visibility change
  useEffect(() => {
    const fetchAvatarData = async () => {
      if (dataFetched) return; // Prevent re-fetching

      try {
        // Fetch system assistant
        const systemResponse = await getSystemAssistantConversation();
        setSystemAssistant(systemResponse);

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

        // Fetch user conversations
        const conversationsResponse = await getAssistantConversation();
        if (conversationsResponse.success) {
          setConversations(conversationsResponse.conversations);
        }

        // Fetch learning topics
        const learningTopicsResponse = await getInstructorListConversations(
          1,
          100,
          "",
          1,
          "",
          "Learning Topic"
        );
        if (learningTopicsResponse.success) {
          setLearningTopics(learningTopicsResponse.conversations);
        }

        // Fetch sharing data
        const sharingResponse = await getInstructorSharedConversations();
        if (sharingResponse.success) {
          setSharedConversations(sharingResponse.conversations);
        }

        setDataFetched(true); // Mark as fetched
      } catch (error) {
        console.error("Failed to fetch avatar data:", error);
      }
    };

    // Fetch data only once when component mounts
    fetchAvatarData();
  }, [dataFetched]); // Include dataFetched in dependencies

  // Handle avatar click in collapsed view - DON'T auto-expand
  const handleAvatarClick = async (
    conversation: ConversationListItem | SystemAssistantResponse,
    isSystem = false
  ) => {
    if (isChatLoading) return;

    setIsChatLoading(true);

    try {
      if (isSystem && systemAssistant) {
        if (systemAssistant.id) {
          setConversationId(systemAssistant.id);
          setAssistantId(systemAssistant.assistants?.id);
          setRightPanel("helps");
        } else if (systemAssistant.assistants?.id) {
          const response = await createFirstConversation(
            systemAssistant.assistants.id
          );
          setConversationId(response.conversation_id);
          setAssistantId(systemAssistant.assistants.id);
          setRightPanel("helps");
        }
      } else {
        const conv = conversation as ConversationListItem;
        setAssistantId(conv.assistants?.id);
        setConversationId(conv.id);
        setRightPanel("tasks");
      }
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle collaborative conversation click
  const handleCollaborativeClick = (
    conversation: InstructorSharedConversationItem
  ) => {
    if (isChatLoading || !conversation.conversation_info) return;

    setIsChatLoading(true);

    try {
      setConversationId(conversation.conversation_info.id);
      setAssistantId(conversation.conversation_info.assistants?.id);
      setMetaData({
        ...metaData,
        assistantId: conversation.conversation_info.assistants?.id,
      });
      setRightPanel("assistant-dashboard");
    } finally {
      setIsChatLoading(false);
    }
  };

  // Generate version info string
  const versionInfo = `v.${import.meta.env.VITE_APP_VERSION}.${
    import.meta.env.VITE_APP_LAST_BUILD_DATE
  }`;

  // Collapsed content for BaseHistoryComponent
  const collapsedContent = (
    <div className="mb-4">
      <ul className="space-y-1">
        {/* System Assistant Avatar */}
        {systemAssistant && (
          <li>
            <button
              className={cn(
                "flex items-center w-full px-2 py-2 text-sm rounded-md cursor-pointer",
                "transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                "justify-center"
              )}
              onClick={() => handleAvatarClick(systemAssistant, true)}
              title={
                systemAssistant.assistants?.name || t("history.edvaraAssistant")
              }
            >
              <HistoryAvatar
                imageSrc={systemAssistant.assistants?.image || ""}
                alt={
                  systemAssistant.assistants?.name ||
                  t("history.edvaraAssistant")
                }
              />
            </button>
          </li>
        )}

        {/* User Conversations Avatars */}
        {conversations.slice(0, 8).map((conversation) => (
          <li key={conversation.id}>
            <button
              className={cn(
                "flex items-center w-full px-2 py-2 text-sm rounded-md cursor-pointer",
                "transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                "justify-center"
              )}
              onClick={() => handleAvatarClick(conversation, false)}
              title={conversation.assistants?.name || t("history.assistant")}
            >
              <HistoryAvatar
                imageSrc={conversation.assistants?.image || ""}
                alt={conversation.assistants?.name || t("history.assistant")}
              />
            </button>
          </li>
        ))}
        <Separator />

        {/* Sharing Students Avatars */}
        {sharedConversations.slice(0, 5).map((conversation) => (
          <li key={conversation.id}>
            <button
              className={cn(
                "flex items-center w-full px-2 py-2 text-sm rounded-md cursor-pointer",
                "transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                "justify-center"
              )}
              title={conversation.student_info.name}
              onClick={() => handleCollaborativeClick(conversation)}
            >
              <DualAvatar
                primaryImageSrc={conversation.student_info.avatar_url}
                secondaryImageSrc={
                  conversation.conversation_info?.assistants?.image || ""
                }
                primaryAlt={conversation.student_info.name}
                secondaryAlt="Assistant"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  // Expanded sections for BaseHistoryComponent
  const expandedSections = (
    <>
      {/* ZONE 1: Chats */}
      {(systemAssistant || conversations.length > 0) && (
        <HistorySection
          title={t("history.assistants")}
          isExpanded={isChatsExpanded}
          toggleExpanded={() => setIsChatsExpanded(!isChatsExpanded)}
        >
          {/* BLOCK 1: System Assistant */}
          {systemAssistant && (
            <SystemAssistantBlock
              setIsChatLoading={setIsChatLoading}
              systemAssistantData={systemAssistant}
              assistantId={assistantId}
            />
          )}

          {/* BLOCK 2: User Conversations */}
          {conversations.length > 0 && (
            <UserConversationsBlock
              setIsChatLoading={setIsChatLoading}
              conversationsData={conversations}
              assistantId={assistantId}
            />
          )}
        </HistorySection>
      )}

      {/* ZONE 2: Learning Topics */}
      {learningTopics.length > 0 && (
        <HistorySection
          title={t("history.trainingTopics")}
          isExpanded={isLearningTopicsExpanded}
          toggleExpanded={() =>
            setIsLearningTopicsExpanded(!isLearningTopicsExpanded)
          }
        >
          <LearningTopicBlock
            searchQuery={searchQuery}
            setIsChatLoading={setIsChatLoading}
            learningTopicsData={learningTopics}
            conversationId={conversationId}
          />
        </HistorySection>
      )}

      {/* ZONE 3: Sharing */}
      {sharedConversations.length > 0 && (
        <HistorySection
          title={t("history.collaborativeTopics")}
          isExpanded={isSharingExpanded}
          toggleExpanded={() => setIsSharingExpanded(!isSharingExpanded)}
        >
          <SharingBlock
            searchQuery={searchQuery}
            sharingData={sharedConversations}
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
      historyTitle={t("student.history.title")}
      collapsedContent={collapsedContent}
      expandedSections={expandedSections}
      versionInfo={versionInfo}
    />
  );
}
