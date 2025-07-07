import { SearchIcon, AlignJustify } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { H5 } from "@/components/ui/typography";
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
import { Separator } from "@/components/ui/separator";
import {
  getSystemAssistantConversation,
  getListConversations,
  createFirstConversation,
} from "@/api/conversations";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import type { SystemAssistantResponse } from "@/api/conversations";

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
  } = useStudent();
  const [searchQuery, setSearchQuery] = useState("");

  // Use props if provided, otherwise fall back to context
  const isHistoryVisible = propIsHistoryVisible;
  const toggleHistory = propToggleHistory;

  // State for collapsed view avatars
  const [systemAssistant, setSystemAssistant] =
    useState<SystemAssistantResponse | null>(null);
  const [conversations, setConversations] = useState<ConversationListItem[]>(
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

        // Fetch user conversations
        const conversationsResponse = await getListConversations();
        if (conversationsResponse.success) {
          setConversations(conversationsResponse.conversations);
        }

        setDataFetched(true); // Mark as fetched
      } catch (error) {
        console.error("Failed to fetch avatar data:", error);
      }
    };

    // Fetch data only once when component mounts
    fetchAvatarData();
  }, []); // Empty dependency array - only run once

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
        setRightPanel("assistantTopics");
      }

      // DON'T auto-expand - let user manually expand if they want
      // toggleHistory();  // <-- Removed this line
    } finally {
      setIsChatLoading(false);
    }
  };

  // Collapsed state - show avatars and expand button
  if (!isHistoryVisible) {
    return (
      <div className={cn(className, "border-r border-border w-16")}>
        <div className="bg-background h-[calc(100vh-3.5rem)]">
          {/* Navigation section */}
          <div
            className="p-2 overflow-y-auto no-scrollbar"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            <div className="mb-4">
              <ul className="space-y-1 mt-1">
                {/* Expand button */}
                <li>
                  <button
                    className={cn(
                      "flex items-center w-full px-2 py-2 text-sm rounded-md cursor-pointer",
                      "transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                      "justify-center"
                    )}
                    onClick={toggleHistory}
                    title="Expand history"
                  >
                    <AlignJustify className="h-4 w-4" />
                  </button>
                </li>

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
                        systemAssistant.assistants?.name || "Edvara Assistant"
                      }
                    >
                      <Avatar className="overflow-hidden">
                        <AvatarImage
                          src={systemAssistant.assistants?.image || ""}
                        />
                      </Avatar>
                    </button>
                  </li>
                )}

                {/* User Conversations Avatars */}
                {conversations.slice(0, 10).map((conversation) => (
                  <li key={conversation.id}>
                    <button
                      className={cn(
                        "flex items-center w-full px-2 py-2 text-sm rounded-md cursor-pointer",
                        "transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                        "justify-center"
                      )}
                      onClick={() => handleAvatarClick(conversation, false)}
                      title={conversation.assistants?.name || "Assistant"}
                    >
                      <Avatar className="overflow-hidden">
                        <AvatarImage
                          src={conversation.assistants?.image || ""}
                        />
                      </Avatar>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expanded state - show full history component
  return (
    <div className={cn(className, "border-r border-border")}>
      <div className="bg-background text-sm h-[calc(100vh-3.5rem)] p-4 ">
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between h-full p-0 pb-6">
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 transition-all duration-300"
                      onClick={toggleHistory}
                      aria-label="Collapse history"
                    >
                      <AlignJustify className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Collapse history
                  </TooltipContent>
                </Tooltip>
                <H5>Chat History</H5>
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-2 pb-4">
            <SearchIcon className="absolute left-4 h-4 text-muted-foreground" />
            <Input
              className="h-8 pl-10"
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col h-full">
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
            <Separator orientation="horizontal" className="w-full my-1" />
          </div>

          <div className="text-[10px] text-center mb-3">
            {/* {renderDisclaimerText()} */}
            <span className="text-[9px] block font-normal text-xs truncate">
              v.{import.meta.env.VITE_APP_VERSION}.
              {import.meta.env.VITE_APP_LAST_BUILD_DATE}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
