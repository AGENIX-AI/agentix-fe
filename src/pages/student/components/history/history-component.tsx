"use client";

import { Inbox, Loader2, SearchIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useRef } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Large } from "@/components/ui/typography";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

import { useStudent } from "@/contexts/StudentContext";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import { eventBus } from "@/lib/utils/event/eventBus";

interface HistoryComponentProps {
  className?: string;
}

export function HistoryComponent({ className }: HistoryComponentProps) {
  const {
    setCharacterId,
    setConversationId,
    characterInfo,
    setRightPanel,
    isMessageLoading,
  } = useStudent();
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const conversationsRef = useRef<ConversationListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchConversations() {
      // try {
      //   const response = await getListConversations();
      //   if (response.success) {
      //     setConversations(response.conversations);
      //     conversationsRef.current = response.conversations;
      //   }
      // } catch (error) {
      //   console.error("Failed to fetch conversations:", error);
      // } finally {
      //   setIsLoading(false);
      // }
      console.log("fetch conversation");
    }

    fetchConversations();
  }, []);
  const renderDisclaimerText = () => {
    return `${
      characterInfo?.name || "The assistant"
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
      conversation.name.toLowerCase().includes(query) ||
      conversation.tagline.toLowerCase().includes(query) ||
      conversation.conversation?.last_message?.content
        ?.toLowerCase()
        .includes(query)
    );
  });

  // Sort conversations to prioritize "Edvara Assisstant" at the top
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.name === "Edvara Assisstant" && b.name !== "Edvara Assisstant")
      return -1;
    if (a.name !== "Edvara Assisstant" && b.name === "Edvara Assisstant")
      return 1;
    return 0;
  });

  // Separate Edvara Assisstant conversations from others
  const edvaraAgentConversations = sortedConversations.filter(
    (conversation) => conversation.name === "Edvara Assisstant"
  );
  const otherConversations = sortedConversations.filter(
    (conversation) => conversation.name !== "Edvara Assisstant"
  );

  const handleConversationClick = async (
    conversation: ConversationListItem
  ) => {
    // Set character id in the AppPageContext
    // The AppPageProvider will automatically fetch and set the character info
    if (isMessageLoading) return;
    console.log("Setting character id:", conversation.id);
    setCharacterId(conversation.id);
    setConversationId(null);

    // Set conversation id in the AppPageContext
    // The AppPageProvider will automatically fetch and set the conversation info
    if (conversation.conversation) {
      setConversationId(conversation.conversation.id);
    } else {
      // const response = await createFirstConversation(conversation.id);
      // setConversationId(response.conversation.id);
      console.log("createFirstConversation");
    }
    // Change the right panel to assistantTopics
    setRightPanel("assistantTopics");
  };

  return (
    <div className={cn(className, "border-r border-border no-scrollbar")}>
      <div className="bg-background text-sm h-[calc(100vh-3.5rem)] p-5">
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div>
            <div className="flex items-center justify-start h-full p-0 pt-2 pb-6">
              <Large className="font-bold flex items-center gap-2">
                Chat History
              </Large>
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
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-4 text-muted-foreground">
                  <Inbox className="h-8 w-8 mb-2" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                <>
                  {/* Edvara Assisstant Conversations */}
                  {edvaraAgentConversations.map((conversation, index) => (
                    <div key={conversation.id}>
                      <div
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleConversationClick(conversation)}
                      >
                        <Avatar>
                          <AvatarImage src={conversation.image || ""} />
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">
                              {conversation.name}
                            </p>
                          </div>
                          <p className="text-xs truncate">
                            {conversation.conversation?.last_message?.content
                              ? renderMessageContent(
                                  conversation.conversation.last_message.content
                                )
                              : ""}
                          </p>
                        </div>
                      </div>
                      {index < otherConversations.length - 1 && (
                        <Separator
                          orientation="horizontal"
                          className="w-full my-1"
                        />
                      )}
                    </div>
                  ))}

                  {/* Other Conversations */}
                  {otherConversations.map((conversation, index) => (
                    <div key={conversation.id}>
                      <div
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleConversationClick(conversation)}
                      >
                        <Avatar>
                          <AvatarImage src={conversation.image || ""} />
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">
                              {conversation.name}
                            </p>
                          </div>
                          <p className="text-xs truncate">
                            {conversation.conversation?.last_message?.content
                              ? renderMessageContent(
                                  conversation.conversation.last_message.content
                                )
                              : ""}
                          </p>
                        </div>
                      </div>
                      {index < otherConversations.length - 1 && (
                        <Separator
                          orientation="horizontal"
                          className="w-full my-1"
                        />
                      )}
                    </div>
                  ))}
                </>
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
