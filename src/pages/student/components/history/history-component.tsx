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
import { useStudent } from "@/contexts/StudentContext";
import { SystemAssistantBlock } from "./SystemAssistantBlock";
import { UserConversationsBlock } from "./UserConversationsBlock";
import { TutoringConversationsBlock } from "./TutoringConversationsBlock";
import { CollapsedTutoringView } from "./CollapsedTutoringView";
import { CollaborativeChatsBlock } from "./CollaborativeChatsBlock";
import { CollapsedCollaborativeView } from "./CollapsedCollaborativeView";
import {
  getSystemAssistantConversation,
  getListConversations,
  getStudentLastConversations,
  getStudentSharedConversations,
} from "@/api/conversations";
import type {
  StudentConversationItem,
  SharedConversationItem,
} from "@/api/conversations";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import type { SystemAssistantResponse } from "@/api/conversations";
import { Separator } from "@/components/ui/separator";

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

    console.log(conversation);

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
                      className={`transition-all duration-300 border border-border ${className}`}
                      onClick={toggleHistory}
                      aria-label={
                        isHistoryVisible ? "Collapse history" : "Expand history"
                      }
                    >
                      <AlignJustify className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isHistoryVisible ? "Collapse history" : "Expand history"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="px-0">
              <div className="flex flex-col">
                {/* Assistants section - only show if has system assistant or conversations */}
                {(systemAssistant?.assistants?.image ||
                  conversations.length > 0) && (
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
                        <Avatar
                          className={cn(
                            "h-5 w-5 cursor-pointer border overflow-hidden",
                            assistantId === systemAssistant.assistants.id
                              ? "border-primary"
                              : "border-accent"
                          )}
                          onClick={() =>
                            handleAvatarClick(systemAssistant, true)
                          }
                        >
                          <AvatarImage
                            src={systemAssistant.assistants.image || ""}
                            alt="Avatar"
                          />
                        </Avatar>
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
                              <Avatar
                                className={cn(
                                  "h-5 w-5 cursor-pointer border overflow-hidden",
                                  assistantId === conversation.assistants?.id
                                    ? "border-primary"
                                    : "border-accent"
                                )}
                              >
                                <AvatarImage
                                  src={conversation.assistants?.image || ""}
                                  alt="Avatar"
                                />
                              </Avatar>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Separator between sections - only show if there are sections above and below */}
                  {(systemAssistant?.assistants?.image ||
                    conversations.length > 0) &&
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
          </div>
        </div>
      </div>
    );
  }

  // Expanded state - show full history component
  return (
    <div className={cn(className, "")}>
      <div className="bg-background text-sm p-4 flex flex-col overflow-hidden h-[calc(100vh-4.7rem)] pt-3 pb-2 mt-[2px]">
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`transition-all duration-300 border border-border ${className}`}
                      onClick={toggleHistory}
                      aria-label={
                        isHistoryVisible ? "Collapse history" : "Expand history"
                      }
                    >
                      <AlignJustify className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {isHistoryVisible ? "Collapse history" : "Expand history"}
                  </TooltipContent>
                </Tooltip>
                <Large>Chats</Large>
              </div>
            </div>
          </div>

          {/* Scrollable content area with flex-grow to take available space */}
          <div className="flex-grow overflow-hidden ml-[3px]">
            <div className="h-full overflow-y-auto">
              {/* ZONE 1: Assistants - only show if has system assistant or conversations */}
              {(systemAssistant || conversations.length > 0) && (
                <div className="mb-3">
                  {/* Assistants Section Header */}
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
                        Chats with Assistants
                      </span>
                    </div>
                  </div>

                  {/* Assistants Content */}
                  {isChatsExpanded && (
                    <div className="ml-1">
                      {/* BLOCK 1: System Assistant */}
                      <SystemAssistantBlock
                        setIsChatLoading={setIsChatLoading}
                        systemAssistantData={systemAssistant}
                        assistantId={assistantId}
                      />

                      {/* BLOCK 2: User Conversations */}
                      <UserConversationsBlock
                        searchQuery={searchQuery}
                        setIsChatLoading={setIsChatLoading}
                        conversationsData={conversations}
                        assistantId={assistantId}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ZONE 2: Tutoring - only show if has tutoring conversations */}
              {tutoringConversations.length > 0 && (
                <div className="mb-3">
                  {/* Tutoring Section Header */}
                  <div
                    className="flex items-center justify-between hover:bg-accent/30 rounded-md cursor-pointer transition-colors py-1"
                    onClick={() => setIsTutoringExpanded(!isTutoringExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      {isTutoringExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-xs">
                        Private Topics
                      </span>
                    </div>
                  </div>

                  {/* Tutoring Content */}
                  {isTutoringExpanded && (
                    <div className="ml-1">
                      <TutoringConversationsBlock
                        tutoringConversations={tutoringConversations}
                        conversationId={conversationId}
                        setIsChatLoading={setIsChatLoading}
                        onConversationClick={handleTutoringClick}
                        searchQuery={searchQuery}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ZONE 3: Collaborative Chats - only show if has shared conversations */}
              {sharedConversations.length > 0 && (
                <div className="mb-3">
                  {/* Collaborative Chats Section Header */}
                  <div
                    className="flex items-center justify-between hover:bg-accent/30 rounded-md cursor-pointer transition-colors py-1"
                    onClick={() =>
                      setIsCollaborativeExpanded(!isCollaborativeExpanded)
                    }
                  >
                    <div className="flex items-center gap-2">
                      {isCollaborativeExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium text-xs">
                        Collaborative Chats
                      </span>
                    </div>
                  </div>

                  {/* Collaborative Chats Content */}
                  {isCollaborativeExpanded && (
                    <div className="ml-1">
                      <CollaborativeChatsBlock
                        sharedConversations={sharedConversations}
                        conversationId={conversationId}
                        setIsChatLoading={setIsChatLoading}
                        onConversationClick={handleCollaborativeClick}
                        searchQuery={searchQuery}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-center pb-[4px]">
            {/* {renderDisclaimerText()} */}
            <span className="text-[9px] block font-normal text-xs truncate ">
              v.{import.meta.env.VITE_APP_VERSION}.
              {import.meta.env.VITE_APP_LAST_BUILD_DATE}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
