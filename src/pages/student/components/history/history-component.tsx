import { SearchIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useRef } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { H5 } from "@/components/ui/typography";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

import { useStudent } from "@/contexts/StudentContext";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import { eventBus } from "@/lib/utils/event/eventBus";
import { getListConversations } from "@/api/conversations";

interface HistoryComponentProps {
  className?: string;
}

export function HistoryComponent({ className }: HistoryComponentProps) {
  const {
    setAssistantId,
    setConversationId,
    assistantInfo,
    setRightPanel,
    setChatPanel,
    isMessageLoading,
  } = useStudent();
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const conversationsRef = useRef<ConversationListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  // Display loading state for the history component
  const showLoadingState = isLoading && conversations.length === 0;

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await getListConversations();
      if (response.success) {
        setConversations(response.conversations);
        conversationsRef.current = response.conversations;
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch of conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Listen for reload-history event
  useEffect(() => {
    const unsubscribe = eventBus.on("reload-history", () => {
      console.log("Reloading conversation history...");
      fetchConversations();
    });

    return unsubscribe;
  }, []);

  const renderDisclaimerText = () => {
    return `${
      assistantInfo?.name || "The assistant"
    } may be wrong. Please verify.`;
  };
  // Listen for conversation updates
  useEffect(() => {
    const unsubscribe = eventBus.on("conversation-update", (data) => {
      console.log("HistoryComponent received conversation-update event:", data);
      console.log("Current conversations:", conversations);

      setConversations((prevConversations) => {
        // Find the conversation that was updated by conversationId
        const updatedConversationIndex = prevConversations.findIndex(
          (conversation) => conversation.id === data.conversationId
        );

        console.log(
          "Conversation index found:",
          updatedConversationIndex,
          updatedConversationIndex !== -1
            ? prevConversations[updatedConversationIndex]
            : "Not found"
        );

        if (updatedConversationIndex === -1) {
          console.log(
            "Conversation not found in history. No update performed."
          );
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
        const newConversationsRef = [...conversationsRef.current];

        const updatedConversation = {
          ...newConversationsRef[updatedConversationIndex],
          last_message: data.lastMessage,
        };

        newConversationsRef.splice(updatedConversationIndex, 1);
        newConversationsRef.unshift(updatedConversation);

        conversationsRef.current = newConversationsRef;
      }
    });

    return unsubscribe;
  }, []);

  // Function to safely render HTML content
  const renderMessageContent = (content: string) => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;

    // Get text content without HTML tags
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    // If the content is just text, return it directly
    if (content === textContent) {
      return content;
    }

    // If it contains HTML, return the text content
    return textContent;
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (conversation.assistants?.name?.toLowerCase() || "").includes(query) ||
      (conversation.assistants?.tagline?.toLowerCase() || "").includes(query) ||
      (conversation.last_message?.content?.toLowerCase() || "").includes(query)
    );
  });

  // Only show assistant conversations
  const assistantConversations = [...filteredConversations];

  const handleConversationClick = async (
    conversation: ConversationListItem
  ) => {
    // Prevent actions if messages are currently loading
    if (isMessageLoading) return;

    // Set assistant ID from the conversation
    console.log("Setting assistant id:", conversation.id);
    setAssistantId(conversation.assistants?.id);

    if (conversation) {
      // If this is an existing conversation with details
      console.log("Setting conversation id:", conversation.id);
      setConversationId(conversation.id);
      // Fetch chat history for this conversation
    } else {
      // Reset states for a new conversation
      setConversationId(null);
    }

    // Change the right panel to assistantTopics
    setRightPanel("assistantTopics");
    setChatPanel("chat");
  };

  return (
    <div className={cn(className, "border-r border-border no-scrollbar")}>
      <div className="bg-background text-sm h-[calc(100vh-3.5rem)] p-6">
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div>
            <div className="flex items-center justify-start h-full p-0 pb-6">
              <H5>Chat History</H5>
            </div>
          </div>

          <div className="relative w-full flex items-center gap-2 pb-4">
            <SearchIcon className="absolute left-4 h-4 text-muted-foreground" />
            <Input
              className="h-8 pl-10"
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea className="flex-1">
            {showLoadingState ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {assistantConversations.map(
                  (conversation: ConversationListItem, index: number) => (
                    <div key={conversation.id}>
                      <div
                        className="flex items-center gap-3 p-2 hover:bg-accent cursor-pointer !rounded-lg"
                        onClick={() => handleConversationClick(conversation)}
                      >
                        <Avatar className="overflow-hidden">
                          <AvatarImage
                            src={conversation.assistants?.image || ""}
                          />
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">
                              {conversation.assistants?.name || "Assistant"}
                            </p>
                          </div>
                          <p className="text-xs truncate">
                            {conversation.last_message?.sender == "user"
                              ? "You: "
                              : ""}
                            {conversation.last_message?.content ||
                              renderMessageContent(
                                conversation.last_message?.content || ""
                              )}
                          </p>
                        </div>
                      </div>
                      {index < assistantConversations.length - 1 && (
                        <Separator
                          orientation="horizontal"
                          className="w-full my-1"
                        />
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </ScrollArea>

          <div className="text-[10px] text-center mb-2">
            {renderDisclaimerText()}
          </div>
        </div>
      </div>
    </div>
  );
}
