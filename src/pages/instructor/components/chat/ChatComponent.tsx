import { ChatHeader } from "./ChatHeader";
import { Loader2Icon } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatBox } from "./ChatBox";
import { Small, Muted } from "@/components/ui/typography";
import { useInstructor } from "@/contexts/InstructorContext";
import { eventBus } from "@/lib/utils/event/eventBus";
import { useTranslation } from "react-i18next";
import {
  getConversationHistory,
  getConversationById,
  type UserInfo,
  type AssistantInfo,
  uploadConversationImage,
} from "@/api/conversations";
import { format } from "date-fns";
import { ChatProvider } from "@/contexts/InstructorChatContext";
import { sendInstructorMessage } from "@/api/instructor";
import * as Sentry from "@sentry/react";
import { Separator } from "@/components/ui/separator";
import type { Conversation } from "@/services/conversation";

// Subcomponents
const LoadingState = memo(() => {
  const { t } = useTranslation();
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2Icon className="h-10 w-10 text-primary animate-spin" />
        <Muted className="text-center">{t('chat.loading.conversation')}</Muted>
      </div>
    </div>
  );
});

LoadingState.displayName = "LoadingState";

const TypingIndicator = memo(
  ({ avatar_url, name }: { avatar_url?: string; name?: string }) => {
    const { t } = useTranslation();
    return (
    <div className="flex items-start flex-col">
      <div className="flex items-center gap-2 mb-1">
        <Avatar className="h-6 w-6">
          <AvatarImage src={avatar_url} alt={name || t('chat.roles.assistant')} />
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
            {name
              ? name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "AI"}
          </AvatarFallback>
        </Avatar>
        <Small className="font-medium">{name || t('chat.roles.assistant')}</Small>
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
  );
  }
);

TypingIndicator.displayName = "TypingIndicator";

interface Message {
  sender: "agent" | "student" | "instructor";
  content: string;
  time: number;
  invocation_id?: string;
}

// WebSocket event interface
interface WebSocketEvent {
  user_id: string;
  conversation_id: string;
  content: string;
  sender: string;
  invocation_id?: string;
  timestamp: string;
}

// Main Component
export function ChatComponent() {
  const { t } = useTranslation();
  const {
    assistantId,
    assistantInfo,
    setConversationId,
    conversationId,
    isChatLoading,
    setIsChatLoading,
  } = useInstructor();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isAgentResponding, setIsAgentResponding] = useState<boolean>(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversationData, setConversationData] = useState<{
    studentInfo?: UserInfo;
    instructorInfo?: UserInfo;
    assistantInfo?: AssistantInfo;
  }>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const processedMessageIds = useRef<Set<string>>(new Set()); // Track processed message IDs

  console.log(isUploadingFile);

  // Event listener for WebSocket messages from left-panel
  useEffect(() => {
    const handleWebSocketMessage = (event: WebSocketEvent) => {
      console.log("handleWebSocketMessage", event);
      // Only handle messages for the current conversation
      if (!conversationId || event.conversation_id !== conversationId) {
        return;
      }

      // Create a unique key for message deduplication
      const messageKey =
        event.invocation_id ||
        `${event.sender}-${event.content}-${event.timestamp}`;

      // Skip messages that have already been processed (deduplication)
      if (processedMessageIds.current.has(messageKey)) {
        console.log("Message already processed, skipping:", messageKey);
        return;
      }

      console.log(
        "Handling WebSocket message for current conversation:",
        event
      );

      // Only render messages from student or agent
      if (event.sender === "student" || event.sender === "agent") {
        // Add message key to processed set
        processedMessageIds.current.add(messageKey);

        // Limit the size of processed message IDs to prevent memory leaks
        if (processedMessageIds.current.size > 1000) {
          console.log(
            "Clearing old processed message IDs to prevent memory leaks"
          );
          processedMessageIds.current.clear();
        }

        // Convert timestamp to Unix timestamp
        const timestamp = new Date(event.timestamp).getTime() / 1000;

        const newMessage: Message = {
          sender: event.sender,
          content: event.content,
          time: Math.floor(timestamp),
          invocation_id: event.invocation_id,
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);

        // Emit event to update history
        eventBus.emit("conversation-update", {
          assistantId: assistantId,
          conversationId: conversationId,
          lastMessage: {
            content: event.content,
            time: event.timestamp,
            sender: event.sender,
          },
        });

        // If it was an agent response, stop the typing indicator
        if (event.sender === "agent") {
          setIsAgentResponding(false);
        }
      }
    };

    // Add event listener and get cleanup function
    const cleanup = eventBus.on("websocket-message", handleWebSocketMessage);

    // Return cleanup function
    return cleanup;
  }, [conversationId, assistantId]);

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

      // Fetch both conversation history and conversation details in parallel
      const [historyResponse, conversationResponse] = await Promise.all([
        getConversationHistory(conversationId),
        getConversationById(conversationId),
      ]);

      setMessages(historyResponse.history);
      setConversationData({
        studentInfo: historyResponse.student_info,
        instructorInfo: historyResponse.instructor_info,
        assistantInfo: historyResponse.assistant,
      });
      setConversation(conversationResponse);

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
      Sentry.captureException(error);
    } finally {
      setIsChatLoading(false);
    }
  };
  useEffect(() => {
    if (conversationId) {
      // Clear processed message IDs when conversation changes
      processedMessageIds.current.clear();
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
        sender: "instructor",
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
      const response = await sendInstructorMessage(conversationId, content);
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

      // Agent response will come through WebSocket, no need to handle it here
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show an error message to the user
    } finally {
      // Reset the agent responding state
      setIsAgentResponding(false);
    }
  };

  // Set up eventBus listener for send-message events from other components
  useEffect(() => {
    // Handler for send-message events
    const handleSendMessageEvent = (data: {
      content: string;
      source: string;
      taskId?: string;
      taskStep?: number;
    }) => {
      // Only process if we have a valid conversationId
      if (conversationId) {
        handleSendMessage(data.content);
      }
    };

    // Subscribe to the send-message event and get the cleanup function
    const unsubscribe = eventBus.on("send-message", handleSendMessageEvent);

    // Clean up the subscription when the component unmounts
    return unsubscribe;
  }, [conversationId]); // We don't need handleSendMessage in deps as it's in component scope

  // Handle locally generated messages (from message cards, tasks, etc.)
  // Note: External messages from student/agent come through WebSocket
  const handleNewMessage = (newMessage: {
    sender: "agent" | "student" | "instructor";
    content: string;
    invocation_id?: string;
  }) => {
    if (!conversationId) return;
    console.log("handleNewMessage (local):", newMessage);

    // Add the new message to the chat
    const agentMessage: Message = {
      sender: newMessage.sender,
      content: newMessage.content,
      time: Date.now(),
      invocation_id: newMessage.invocation_id,
    };

    setMessages((prevMessages) => [...prevMessages, agentMessage]);

    // Emit event to update history
    eventBus.emit("conversation-update", {
      assistantId: assistantId,
      conversationId: conversationId,
      lastMessage: {
        content: newMessage.content,
        time: new Date().toISOString(),
        sender: newMessage.sender,
      },
    });
  };

  // Helper function to escape markdown image syntax
  const escapeMarkdownImage = (imageUrl: string, text?: string) => {
    const escapedImageMarkdown = `![image](${imageUrl})`;
    return text ? `${escapedImageMarkdown}\n\n${text}` : escapedImageMarkdown;
  };

  // Consolidated function to handle file uploads
  const handleFileUpload = async (file: File, textInput?: string) => {
    if (!conversationId || isAgentResponding) return;

    try {
      console.log("handleFileUpload - Starting upload for file:", file.name);
      // Show loading indicator for file upload
      setIsUploadingFile(true);
      setIsAgentResponding(true);

      // Upload the file to the server using the API function
      console.log("handleFileUpload - Calling uploadConversationImage");
      const uploadResponse = await uploadConversationImage(file);
      console.log("handleFileUpload - Upload response:", uploadResponse);

      if (uploadResponse.success && uploadResponse.image_path) {
        console.log(
          "handleFileUpload - Upload successful, image_path:",
          uploadResponse.image_path
        );
        // Format the message with the image in markdown format
        const messageWithImage = escapeMarkdownImage(
          uploadResponse.image_path,
          textInput
        );
        console.log("handleFileUpload - Formatted message:", messageWithImage);

        // Add user message with image to the chat immediately
        const userMessage: Message = {
          sender: "instructor",
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
            sender: "instructor",
          },
        });

        // Send message to API
        console.log(
          "handleFileUpload - Calling sendInstructorMessage with conversationId:",
          conversationId
        );
        const response = await sendInstructorMessage(
          conversationId,
          messageWithImage
        );
        console.log(
          "handleFileUpload - sendInstructorMessage response:",
          response
        );

        // Handle special action message types
        if (
          response.message &&
          response.message.startsWith("Action:SetConversationId:")
        ) {
          const id = response.message.replace("Action:SetConversationId:", "");
          setConversationId(id);
          return;
        }
      } else {
        console.error(
          "handleFileUpload - Upload failed or no image_path in response"
        );
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error handling file upload:", error);
    } finally {
      setIsAgentResponding(false);
      setIsUploadingFile(false);
    }
  };

  // Function to handle sending message with image from data URL
  const handleSendMessageWithImage = async (
    content: string,
    imageData: string
  ) => {
    if (!conversationId || isAgentResponding) return;

    try {
      console.log(
        "handleSendMessageWithImage - Starting with content length:",
        content?.length
      );
      // Show agent responding indicator
      setIsAgentResponding(true);

      // Convert data URL to File
      console.log("handleSendMessageWithImage - Converting data URL to File");
      const fetchResponse = await fetch(imageData);
      const blob = await fetchResponse.blob();
      const file = new File([blob], "image.jpg", { type: blob.type });
      console.log(
        "handleSendMessageWithImage - Created File:",
        file.name,
        file.type,
        file.size
      );

      // Upload the image using the API
      console.log(
        "handleSendMessageWithImage - Calling uploadConversationImage"
      );
      const uploadResponse = await uploadConversationImage(file);
      console.log(
        "handleSendMessageWithImage - Upload response:",
        uploadResponse
      );

      if (uploadResponse.success && uploadResponse.image_path) {
        console.log(
          "handleSendMessageWithImage - Upload successful, image_path:",
          uploadResponse.image_path
        );
        // Format the message with the image in markdown format
        const messageWithImage = escapeMarkdownImage(
          uploadResponse.image_path,
          content
        );
        console.log(
          "handleSendMessageWithImage - Formatted message:",
          messageWithImage
        );

        // Add user message with image to the chat immediately
        const userMessage: Message = {
          sender: "instructor",
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
            content: content || t('chat.message.image_uploaded'), // Using the text content without the image for history display
            time: new Date().toISOString(),
            sender: "instructor",
          },
        });

        // Send message to API
        console.log(
          "handleSendMessageWithImage - Calling sendInstructorMessage with conversationId:",
          conversationId
        );
        const response = await sendInstructorMessage(
          conversationId,
          messageWithImage
        );
        console.log(
          "handleSendMessageWithImage - sendInstructorMessage response:",
          response
        );

        // Handle special action message types
        if (
          response.message &&
          response.message.startsWith("Action:SetConversationId:")
        ) {
          const id = response.message.replace("Action:SetConversationId:", "");
          setConversationId(id);
          return;
        }
      } else {
        console.error(
          "handleSendMessageWithImage - Upload failed or no image_path in response"
        );
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error sending message with image:", error);
    } finally {
      setIsAgentResponding(false);
    }
  };

  // Render loading state
  if (isChatLoading) {
    return (
      <div className="h-full w-full flex flex-col bg-background">
        <ChatHeader
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
      <div className="h-full w-full flex flex-col bg-background">
        <ChatHeader
          agentName={assistantInfo?.name}
          tagline={assistantInfo?.tagline}
          agentImage={assistantInfo?.image}
        />{" "}
        <div className="flex items-center justify-between px-4">
          <Separator />
        </div>
        <div className="flex flex-col rounded-lg border-none h-[calc(100%-3rem)] chat-messages-container">
          <ChatBox
            messages={messages}
            onSendMessageWithImage={handleSendMessageWithImage}
            onFileUpload={handleFileUpload}
            className="h-full border-0 rounded-none shadow-none bg-background"
            name={
              conversationData.assistantInfo?.name ?? assistantInfo?.name ?? ""
            }
            avatar_url={
              conversationData.assistantInfo?.image ??
              assistantInfo?.image ??
              ""
            }
            inputRef={inputRef}
            isAgentResponding={isAgentResponding}
            conversation={conversation}
            conversationData={conversationData}
          />
        </div>
      </div>
    </ChatProvider>
  );
}
