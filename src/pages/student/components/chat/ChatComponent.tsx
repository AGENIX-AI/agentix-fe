import { ChatHeader } from "./ChatHeader";
import { Loader2Icon } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatBox } from "./ChatBox";
import { Small, Muted } from "@/components/ui/typography";
import { useStudent } from "@/contexts/StudentContext";

import { eventBus } from "@/lib/utils/event/eventBus";
import { getConversationHistory, sendMessage } from "@/api/conversations";
import { format } from "date-fns";
import { ChatProvider } from "@/contexts/ChatContext";

// Subcomponents
const LoadingState = memo(() => (
  <div className="h-full w-full flex flex-col items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2Icon className="h-10 w-10 text-primary animate-spin" />
      <Muted className="text-center">Loading conversation...</Muted>
    </div>
  </div>
));

LoadingState.displayName = "LoadingState";

const TypingIndicator = memo(
  ({ avatar_url, name }: { avatar_url?: string; name?: string }) => (
    <div className="flex items-start flex-col">
      <div className="flex items-center gap-2 mb-1">
        <Avatar className="h-6 w-6">
          <AvatarImage src={avatar_url} alt={name || "Assistant"} />
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
            {name
              ? name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "AI"}
          </AvatarFallback>
        </Avatar>
        <Small className="font-medium">{name || "Assistant"}</Small>
        <Small className="text-[10px]">{format(new Date(), "h:mm a")}</Small>
      </div>
      <div className="flex max-w-[80%] items-center gap-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm px-4 py-3 text-foreground ml-6">
        <div className="flex space-x-2">
          <div
            className="w-2 h-2 rounded-full bg-primary animate-pulse"
            style={{
              animationDelay: "0ms",
              animationDuration: "1.2s",
            }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-pulse"
            style={{
              animationDelay: "300ms",
              animationDuration: "1.2s",
            }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-pulse"
            style={{
              animationDelay: "600ms",
              animationDuration: "1.2s",
            }}
          />
        </div>
      </div>
    </div>
  )
);

TypingIndicator.displayName = "TypingIndicator";

interface Message {
  sender: "user" | "agent_response";
  content: string;
  time: number;
  invocation_id?: string;
}
// Main Component
export function ChatComponent() {
  const {
    isHistoryVisible,
    toggleHistory,
    assistantId,
    assistantInfo,
    setConversationId,
    conversationId,
    isChatLoading,
    setIsChatLoading,
  } = useStudent();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isAgentResponding, setIsAgentResponding] = useState<boolean>(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Add effect to focus input when isAgentResponding changes from true to false
  useEffect(() => {
    if (!isAgentResponding && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isAgentResponding]);

  const fetchMessages = async () => {
    try {
      if (!conversationId) return;
      setIsChatLoading(true);
      const messages = await getConversationHistory(conversationId);
      setMessages(messages);
      // Scroll to the bottom of the chat after messages are loaded
      setTimeout(() => {
        const chatContainer = document.querySelector(
          ".chat-messages-container"
        );
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsChatLoading(false);
    }
  };
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  // Effect to scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      const chatContainer = document.querySelector(".chat-messages-container");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!conversationId || isAgentResponding) return;

    try {
      // Set agent responding state to true to show typing indicator
      setIsAgentResponding(true);

      // Add user message to the chat immediately
      const userMessage: Message = {
        sender: "user",
        content: content,
        time: Date.now(),
        invocation_id: "",
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Emit event for user message
      eventBus.emit("conversation-update", {
        assistantId: assistantId,
        conversationId: conversationId,
        lastMessage: {
          content: content,
          time: new Date().toISOString(),
          sender: "user",
        },
      });

      // Send message to API
      console.log(
        "Sending message to API with conversationId:",
        conversationId
      );
      const response = await sendMessage(conversationId, content);
      console.log("Received response:", response);

      // Handle special action message types
      if (
        response.message &&
        response.message.startsWith("Action:SetConversationId:")
      ) {
        const id = response.message.replace("Action:SetConversationId:", "");
        setConversationId(id);
        return;
      }

      if (response.success) {
        // Add agent response to the chat
        const agentMessage: Message = {
          sender: "agent_response",
          content: response.message,
          time: Date.now(),
          invocation_id: response.invocation_id,
        };

        setMessages((prevMessages) => [...prevMessages, agentMessage]);

        // Emit event to update history
        eventBus.emit("conversation-update", {
          assistantId: assistantId,
          conversationId: conversationId,
          lastMessage: {
            content: response.message,
            time: new Date().toISOString(),
            sender: "agent_response",
          },
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show an error message to the user
    } finally {
      // Reset the agent responding state
      setIsAgentResponding(false);
    }
  };

  const handleNewMessage = (newMessage: {
    sender: "agent_response" | "user";
    content: string;
  }) => {
    if (!conversationId) return;
    console.log("handleNewMessage", newMessage);

    // Add the new message to the chat
    const agentMessage: Message = {
      sender: "agent_response",
      content: newMessage.content,
      time: Date.now(),
    };

    setMessages((prevMessages) => [...prevMessages, agentMessage]);

    // Emit event to update history
    eventBus.emit("conversation-update", {
      assistantId: assistantId,
      conversationId: conversationId,
      lastMessage: {
        content: newMessage.content,
        time: new Date().toISOString(),
        sender: "agent_response",
      },
    });
  };

  // Helper function to escape markdown image syntax
  const escapeMarkdownImage = (imageUrl: string, text?: string) => {
    const encoded = encodeURIComponent(imageUrl);
    const escapedImageMarkdown = `![image](${encoded})`;
    return text ? `${escapedImageMarkdown}\n\n${text}` : escapedImageMarkdown;
  };

  const handleSendMessageWithImage = async (
    content: string,
    imageData: string
  ) => {
    if (!conversationId || isAgentResponding) return;

    try {
      // Set agent responding state to true to show typing indicator
      setIsAgentResponding(true);

      // Format the message with the image in markdown format with escaped syntax
      const messageWithImage = escapeMarkdownImage(imageData, content);

      // Add user message with image to the chat immediately
      const userMessage: Message = {
        sender: "user",
        content: messageWithImage,
        time: Date.now(),
        invocation_id: "",
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Emit event for user message with image
      eventBus.emit("conversation-update", {
        assistantId: assistantId,
        conversationId: conversationId,
        lastMessage: {
          content: content, // Using the text content without the image for history display
          time: new Date().toISOString(),
          sender: "user",
        },
      });

      // Send message to API
      const response = await sendMessage(conversationId, messageWithImage);

      // Handle special action message types
      if (
        response.message &&
        response.message.startsWith("Action:SetConversationId:")
      ) {
        const id = response.message.replace("Action:SetConversationId:", "");
        setConversationId(id);
        return;
      }

      if (response.success) {
        // Add agent response to the chat
        const agentMessage: Message = {
          sender: "agent_response",
          content: response.message,
          time: Date.now(),
          invocation_id: response.invocation_id,
        };

        setMessages((prevMessages) => [...prevMessages, agentMessage]);

        // Emit event to update history
        eventBus.emit("conversation-update", {
          assistantId: assistantId,
          conversationId: conversationId,
          lastMessage: {
            content: response.message,
            time: new Date().toISOString(),
            sender: "agent_response",
          },
        });
      }
    } catch (error) {
      console.error("Error sending message with image:", error);
      // Optionally show an error message to the user
    } finally {
      // Reset the agent responding state
      setIsAgentResponding(false);
    }
  };

  const handleFileUpload = async (file: File, textInput?: string) => {
    if (!conversationId || isAgentResponding) return;

    try {
      // Show loading indicator for file upload only
      setIsUploadingFile(true);

      // Read the file as a data URL
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          if (e.target?.result) {
            const imageData = e.target.result.toString();

            // Format the message with the image in markdown format with escaped syntax
            const messageWithImage = escapeMarkdownImage(imageData, textInput);

            // Add user message with image to the chat immediately
            const userMessage: Message = {
              sender: "user",
              content: messageWithImage,
              time: Date.now(),
              invocation_id: "",
            };

            setMessages((prevMessages) => [...prevMessages, userMessage]);

            // Emit event for user file upload
            eventBus.emit("conversation-update", {
              assistantId: assistantId,
              conversationId: conversationId,
              lastMessage: {
                content: textInput || "[Image uploaded]", // Use text input if provided, otherwise a placeholder
                time: new Date().toISOString(),
                sender: "user",
              },
            });

            // Set agent responding state to true to show typing indicator
            setIsAgentResponding(true);

            // Send message to API
            const response = await sendMessage(
              conversationId,
              messageWithImage
            );

            if (response.success) {
              // Add agent response to the chat
              const agentMessage: Message = {
                sender: "agent_response",
                content: response.message,
                time: Date.now(),
                invocation_id: response.invocation_id,
              };

              setMessages((prevMessages) => [...prevMessages, agentMessage]);

              // Emit event to update history
              eventBus.emit("conversation-update", {
                assistantId: assistantId,
                conversationId: conversationId,
                lastMessage: {
                  content: response.message,
                  time: new Date().toISOString(),
                  sender: "agent_response",
                },
              });
            }
          }
        } catch (error) {
          console.error("Error processing file:", error);
        } finally {
          setIsAgentResponding(false);
          setIsUploadingFile(false);
        }
      };

      reader.onerror = () => {
        console.error("Error reading file");
        setIsUploadingFile(false);
      };

      // Start reading the file
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error handling file upload:", error);
      setIsUploadingFile(false);
    }
  };

  // Render loading state
  if (isChatLoading) {
    return (
      <div className="h-full w-full flex flex-col p-5 bg-background">
        <ChatHeader
          isHistoryVisible={isHistoryVisible}
          toggleHistory={toggleHistory}
          disabled={true}
          agentName={assistantInfo?.name}
          tagline={assistantInfo?.tagline}
          agentImage={assistantInfo?.image}
        />
        <div className="h-[calc(100vh-70px-2rem)] flex flex-col rounded-lg ">
          <div className="flex-1 overflow-y-auto p-6 chat-messages-container">
            <LoadingState />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider
      handleSendMessage={handleSendMessage}
      handleNewMessage={handleNewMessage}
    >
      <div className="h-full w-full flex flex-col pt-5 pl-5 pr-5 bg-background">
        <ChatHeader
          isHistoryVisible={isHistoryVisible}
          toggleHistory={toggleHistory}
          agentName={assistantInfo?.name}
          tagline={assistantInfo?.tagline}
          agentImage={assistantInfo?.image}
        />
        <div className="flex flex-col rounded-lg border-none h-[calc(100%-3rem)] pt-2 chat-messages-container">
          <ChatBox
            messages={messages}
            onSendMessageWithImage={handleSendMessageWithImage}
            onFileUpload={handleFileUpload}
            className="h-full border-0 rounded-none shadow-none bg-background"
            name={assistantInfo?.name ?? ""}
            avatar_url={assistantInfo?.image ?? ""}
            inputRef={inputRef}
            isAgentResponding={isAgentResponding}
          />
        </div>
      </div>
    </ChatProvider>
  );
}
