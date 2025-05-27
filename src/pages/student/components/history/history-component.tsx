import { Inbox, Loader2, MessageCircle, SearchIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useRef } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { H4, H5 } from "@/components/ui/typography";
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
    isMessageLoading,
  } = useStudent();
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const conversationsRef = useRef<ConversationListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
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
    }

    fetchConversations();
  }, []);

  const renderDisclaimerText = () => {
    return `${
      assistantInfo?.name || "The assistant"
    } may be wrong. Please verify.`;
  };
  // Listen for conversation updates
  useEffect(() => {
    const unsubscribe = eventBus.on("conversation-update", (data) => {
      setConversations((prevConversations) => {
        // Find the conversation that was updated
        const updatedConversationIndex = prevConversations.findIndex(
          (conversation) =>
            conversation.conversation &&
            conversation.conversation.stream_id === data.streamId.toString() &&
            conversation.conversation.topic_name === data.topicName
        );

        if (updatedConversationIndex === -1) {
          return prevConversations;
        }

        // Create a new array with the updated conversation
        const newConversations = [...prevConversations];

        // Update the conversation with new last_message
        const updatedConversation = {
          ...newConversations[updatedConversationIndex],
          conversation: {
            ...newConversations[updatedConversationIndex].conversation!,
            last_message: data.lastMessage,
          },
        };

        // Remove the conversation from its current position
        newConversations.splice(updatedConversationIndex, 1);

        // Add it to the beginning of the array (move to top)
        newConversations.unshift(updatedConversation);

        return newConversations;
      });

      // Also update the reference
      const updatedConversationIndex = conversationsRef.current.findIndex(
        (conversation) =>
          conversation.conversation &&
          conversation.conversation.stream_id === data.streamId.toString() &&
          conversation.conversation.topic_name === data.topicName
      );

      if (updatedConversationIndex !== -1) {
        const newConversationsRef = [...conversationsRef.current];

        const updatedConversation = {
          ...newConversationsRef[updatedConversationIndex],
          conversation: {
            ...newConversationsRef[updatedConversationIndex].conversation!,
            last_message: data.lastMessage,
          },
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
      (conversation.name?.toLowerCase() || "").includes(query) ||
      (conversation.tagline?.toLowerCase() || "").includes(query) ||
      (
        conversation.conversation?.last_message?.content?.toLowerCase() || ""
      ).includes(query) ||
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
    setAssistantId(conversation.id);

    if (conversation.conversation) {
      // If this is an existing conversation with details
      console.log("Setting conversation id:", conversation.id);
      setConversationId(conversation.id);
      // Fetch chat history for this conversation
    } else {
      // Reset states for a new conversation
      setSelectedConversationId(null);
      setConversationId(null);
    }

    // Change the right panel to assistantTopics
    setRightPanel("assistantTopics");
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
            <div className="space-y-2">
              {assistantConversations.map(
                (conversation: ConversationListItem, index: number) => (
                  <div key={conversation.id}>
                    <div
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => handleConversationClick(conversation)}
                    >
                      <Avatar>
                        <AvatarImage
                          src={
                            conversation.assistants?.image ||
                            conversation.image ||
                            ""
                          }
                        />
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">
                            {conversation.assistants?.name ||
                              conversation.name ||
                              "Assistant"}
                          </p>
                        </div>
                        <p className="text-xs truncate">
                          {conversation.last_message?.content ||
                          conversation.conversation?.last_message?.content
                            ? renderMessageContent(
                                conversation.last_message?.content ||
                                  conversation.conversation?.last_message
                                    ?.content ||
                                  ""
                              )
                            : ""}
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
          </ScrollArea>

          <div className="text-[10px] text-center mb-2">
            {renderDisclaimerText()}
          </div>
        </div>
      </div>
    </div>
  );
}
