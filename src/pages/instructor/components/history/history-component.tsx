import { AlignJustify, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Large } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { SystemAssistantBlock } from "./SystemAssistantBlock";
import { UserConversationsBlock } from "./UserConversationsBlock";
import { SharingBlock } from "../../../instructor/components/history/SharingBlock";
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
        console.log("systemResponse", systemResponse);

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

      // DON'T auto-expand - let user manually expand if they want
      // toggleHistory();  // <-- Removed this line
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
      setIsChatLoading(false);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Collapsed state - show avatars and expand button
  if (!isHistoryVisible) {
    return (
      <div className={cn(className, "border-r border-border w-16")}>
        <div className="bg-background h-[calc(100vh-3.5rem)] p-4 pt-3 mt-[2px]">
          <div className="flex flex-col h-full">
            {/* Header - matching expanded state */}
            <div>
              <div className="flex items-center justify-center pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`transition-all duration-300 border-none ${className}`}
                      onClick={toggleHistory}
                      aria-label={
                        isHistoryVisible
                          ? t("history.collapseHistory")
                          : t("history.expandHistory")
                      }
                    >
                      <AlignJustify className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isHistoryVisible
                      ? t("history.collapseHistory")
                      : t("history.expandHistory")}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Navigation section */}
            <div
              className="overflow-y-auto no-scrollbar"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            >
              <div className="mb-4">
                <ul className="space-y-1">
                  {/* Avatar buttons */}

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
                          systemAssistant.assistants?.name ||
                          t("history.edvaraAssistant")
                        }
                      >
                        <Avatar className="overflow-hidden h-5 w-5">
                          <AvatarImage
                            src={systemAssistant.assistants?.image || ""}
                          />
                        </Avatar>
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
                        title={
                          conversation.assistants?.name ||
                          t("history.assistant")
                        }
                      >
                        <Avatar className="overflow-hidden h-5 w-5">
                          <AvatarImage
                            src={conversation.assistants?.image || ""}
                          />
                        </Avatar>
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
                        <div className="relative flex items-center justify-center h-8 w-8">
                          <Avatar className="h-5 w-5 absolute left-0 bottom-0 cursor-pointer border border-accent overflow-hidden">
                            <AvatarImage
                              src={conversation.student_info.avatar_url}
                              alt={conversation.student_info.name}
                            />
                          </Avatar>
                          <Avatar className="h-5 w-5 absolute right-0 top-0 cursor-pointer border border-accent overflow-hidden">
                            <AvatarImage
                              src={
                                conversation.conversation_info?.assistants
                                  ?.image || ""
                              }
                              alt="Assistant"
                            />
                          </Avatar>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  console.log("conversationsssId", conversationId);
  // Expanded state - show full history component
  return (
    <div className={cn(className, "")}>
      <div className="bg-background text-sm p-4 flex flex-col overflow-hidden h-[calc(100vh-4.7rem)] pt-3 pb-2 mt-[2px]">
        <div className="flex flex-col flex-grow min-h-0 w-full h-full">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`transition-all duration-300 border-none ${className}`}
                      onClick={toggleHistory}
                      aria-label={
                        isHistoryVisible
                          ? t("history.collapseHistory")
                          : t("history.expandHistory")
                      }
                    >
                      <AlignJustify className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isHistoryVisible
                      ? t("history.collapseHistory")
                      : t("history.expandHistory")}
                  </TooltipContent>
                </Tooltip>
                <Large>{t("student.history.title")}</Large>
              </div>
            </div>
          </div>

          {/* Scrollable content area with flex-grow to take available space */}
          <div className="flex-grow overflow-hidden ml-[3px]">
            <div className="h-full overflow-y-auto">
              {/* ZONE 1: Chats */}
              {(systemAssistant || conversations.length > 0) && (
                <div className="mb-3 ">
                  {/* Chats Section Header */}
                  <div
                    className="flex items-center justify-between hover:bg-accent/30 rounded-md cursor-pointer transition-colors py-1"
                    onClick={() => setIsChatsExpanded(!isChatsExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      {isChatsExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-xs">
                        {t("history.assistants")}
                      </span>
                    </div>
                  </div>

                  {/* Chats Content */}
                  {isChatsExpanded && (
                    <div className="ml-1">
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
                    </div>
                  )}
                </div>
              )}

              {/* ZONE 2: Learning Topics */}
              {learningTopics.length > 0 && (
                <div className="mb-3">
                  {/* Learning Topics Section Header */}
                  <div
                    className="flex items-center justify-between hover:bg-accent/30 rounded-md cursor-pointer transition-colors py-1"
                    onClick={() =>
                      setIsLearningTopicsExpanded(!isLearningTopicsExpanded)
                    }
                  >
                    <div className="flex items-center gap-2">
                      {isLearningTopicsExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-xs">
                        {t("history.trainingTopics")}
                      </span>
                    </div>
                  </div>

                  {/* Learning Topics Content */}
                  {isLearningTopicsExpanded && (
                    <div className="ml-1">
                      <LearningTopicBlock
                        searchQuery={searchQuery}
                        setIsChatLoading={setIsChatLoading}
                        learningTopicsData={learningTopics}
                        conversationId={conversationId}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ZONE 3: Sharing */}
              {sharedConversations.length > 0 && (
                <div className="">
                  {/* Sharing Section Header */}
                  <div
                    className="flex items-center justify-between hover:bg-accent/30 rounded-md cursor-pointer transition-colors py-1"
                    onClick={() => setIsSharingExpanded(!isSharingExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      {isSharingExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-xs ">
                        {t("history.collaborativeTopics")}
                      </span>
                    </div>
                  </div>

                  {/* Sharing Content */}
                  {isSharingExpanded && (
                    <SharingBlock
                      searchQuery={searchQuery}
                      sharingData={sharedConversations}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-center">
            {/* {renderDisclaimerText()} */}
            <span className="text-[9px] block font-normal text-xs truncate pb-[4px]">
              v.{import.meta.env.VITE_APP_VERSION}.
              {import.meta.env.VITE_APP_LAST_BUILD_DATE}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
