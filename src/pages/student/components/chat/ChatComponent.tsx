import { ChatHeader } from "@/components/reused/chat/ChatHeader";
import { Loader2Icon } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatBox } from "./ChatBox";
import { Small, Muted } from "@/components/ui/typography";
import { useStudent } from "@/contexts/StudentContext";
import { eventBus } from "@/lib/utils/event/eventBus";
import {
  getConversationHistory,
  sendMessage,
  type AssistantInfo,
  uploadConversationImage,
  listParticipantsBrief,
} from "@/api/conversations";
import { format } from "date-fns";
import { ChatProvider } from "@/contexts/ChatContext";
import * as Sentry from "@sentry/react";
// import { Separator } from "@/components/ui/separator";

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
  id?: string;
  sender: "student" | "instructor" | "agent";
  content: string;
  time: number;
  invocation_id?: string;
  reply_to_brief?: {
    id: string;
    content?: string;
    sender_user_id?: string | null;
    sender_assistant_id?: string | null;
  };
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
  const {
    assistantId,
    assistantInfo,
    setConversationId,
    conversationId,
    isChatLoading,
    setIsChatLoading,
  } = useStudent();

  const [messages, setMessages] = useState<Message[]>([]);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    preview: string;
  } | null>(null);
  const [isAgentResponding, setIsAgentResponding] = useState<boolean>(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  type ChatUser = { id: string; name?: string; avatar_url?: string };
  const [conversationData, setConversationData] = useState<{
    studentInfo?: ChatUser;
    instructorInfo?: ChatUser;
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
        console.log("[Chat] Ignoring WS message due to conversation mismatch", {
          currentConversationId: conversationId,
          eventConversationId: event.conversation_id,
        });
        return;
      }

      // Create a unique key for message deduplication
      const messageKey =
        event.invocation_id ||
        `${event.sender}-${event.content}-${event.timestamp}`;

      // Skip messages that have already been processed (deduplication)
      if (processedMessageIds.current.has(messageKey)) {
        console.log("[Chat] Message already processed, skipping", {
          messageKey,
          event,
        });
        return;
      }

      console.log(
        "Handling WebSocket message for current conversation:",
        event
      );

      // Render messages from agent, instructor, or student (realtime)
      if (
        event.sender === "agent" ||
        event.sender === "instructor" ||
        event.sender === "student"
      ) {
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

        setMessages((prevMessages) => {
          console.log("[Chat] Appending WS message", {
            conversationId,
            event,
            newMessage,
            prevCount: prevMessages.length,
          });
          return [...prevMessages, newMessage];
        });

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
      } else {
        console.log("[Chat] Ignoring WS message due to sender not allowed", {
          sender: event.sender,
          event,
        });
      }
    };

    // Add event listener and get cleanup function
    const cleanup = eventBus.on("websocket-message", handleWebSocketMessage);

    // Return cleanup function
    return cleanup;
  }, [conversationId, assistantId]);

  // Listen to realtime typing events and reflect in UI
  useEffect(() => {
    const handleTypingEvent = (event: any) => {
      try {
        console.log("[Chat] handleTypingEvent", {
          event,
          conversationId,
        });
        const convId =
          event?.message?.conversation_id || event?.conversation_id;
        if (!conversationId || convId !== conversationId) return;
        const typing = Boolean(
          event?.message?.meta?.typing ?? event?.meta?.typing ?? event?.typing
        );
        console.log("[Chat] setIsAgentResponding", { typing, convId });
        setIsAgentResponding(typing);
      } catch (e) {
        console.log("[Chat] typing event parse error", e);
      }
    };

    const cleanup = eventBus.on("websocket-typing", handleTypingEvent);
    return cleanup;
  }, [conversationId]);

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
      const response: any = await getConversationHistory(conversationId);
      // Support new shape (messages[]) and legacy shape (history[])
      if (Array.isArray(response?.messages)) {
        const mapped: Message[] = response.messages.map((m: any) => ({
          id: m.id,
          sender: m.sender_assistant_id ? "agent" : "student",
          content: m.content,
          time:
            Math.floor(
              Date.parse(m.created_at || new Date().toISOString()) / 1000
            ) || Math.floor(Date.now() / 1000),
          invocation_id: undefined,
          reply_to_brief: m.reply_to_brief,
        }));
        setMessages(mapped);
        // No participant info in this response; keep conversationData as-is
      } else if (Array.isArray(response?.history)) {
        setMessages(response.history as Message[]);
        setConversationData({
          studentInfo: response.student_info,
          instructorInfo: response.instructor_info,
          assistantInfo: response.assistant,
        });
      } else {
        setMessages([]);
      }
      // Scroll to the bottom of the chat after messages are loaded
      setTimeout(() => {
        const chatContainer = document.querySelector(
          ".chat-messages-container"
        ) as HTMLElement | null;
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      Sentry.captureException(error);
      setConversationId(null);
      console.error("Error fetching messages:", error);
    } finally {
      setIsChatLoading(false);
    }
  };
  const fetchParticipantsBrief = async () => {
    try {
      if (!conversationId) return;
      const briefs = await listParticipantsBrief(conversationId);
      const assistant = briefs.find((b: any) => b.kind === "assistant");
      const user = briefs.find((b: any) => b.kind === "user");
      const mappedAssistant: AssistantInfo | undefined = assistant
        ? {
            id: assistant.id,
            name: assistant.name,
            image: assistant.image,
            tagline: undefined,
          }
        : undefined;
      const mappedUser: ChatUser | undefined = user
        ? {
            id: user.id,
            name: user.name ?? undefined,
            avatar_url: user.image ?? undefined,
          }
        : undefined;
      setConversationData((prev) => ({
        ...prev,
        assistantInfo: mappedAssistant ?? prev.assistantInfo,
        studentInfo: mappedUser ?? prev.studentInfo,
      }));
    } catch (error) {
      console.error("Error fetching participant briefs:", error);
    }
  };
  useEffect(() => {
    if (conversationId) {
      // Clear processed message IDs when conversation changes
      processedMessageIds.current.clear();
      fetchMessages();
      fetchParticipantsBrief();
    }
  }, [conversationId]);

  // Effect to scroll to bottom when new messages are added
  useEffect(() => {
    if (Array.isArray(messages) && messages.length > 0) {
      const chatContainer = document.querySelector(
        ".chat-messages-container"
      ) as HTMLElement | null;
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
        sender: "student",
        content: content,
        time: Math.floor(Date.now() / 1000),
        invocation_id: "",
      };

      setMessages((prevMessages) => {
        console.log("[Chat] Appending local user message", {
          conversationId,
          userMessage,
          prevCount: prevMessages.length,
        });
        return [...prevMessages, userMessage];
      });

      // Emit event for user message
      eventBus.emit("conversation-update", {
        assistantId: assistantId,
        conversationId: conversationId,
        lastMessage: {
          content: content,
          time: new Date().toISOString(),
          sender: "student",
        },
      });

      // Send message to API
      console.log(
        "Sending message to API with conversationId:",
        conversationId
      );
      const response = await sendMessage(conversationId, content, {
        reply_to_message_id: replyTo?.id,
      });
      console.log("Received response:", response);
      setReplyTo(null);

      // Agent response will come through WebSocket, no need to handle it here
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show an error message to the user
    } finally {
      // Reset the agent responding state
      setIsAgentResponding(false);
    }
  };

  // Handle locally generated messages (from message cards, tasks, etc.)
  // Note: External messages from instructor/agent come through WebSocket
  const handleNewMessage = (newMessage: {
    sender: "student" | "instructor" | "agent";
    content: string;
    invocation_id?: string;
  }) => {
    if (!conversationId) return;
    console.log("handleNewMessage (local):", newMessage);

    // Add the new message to the chat
    const agentMessage: Message = {
      sender: newMessage.sender,
      content: newMessage.content,
      time: Math.floor(Date.now() / 1000),
      invocation_id: newMessage.invocation_id,
    };

    setMessages((prevMessages) => {
      console.log("[Chat] Appending local generated message", {
        conversationId,
        agentMessage,
        prevCount: prevMessages.length,
      });
      return [...prevMessages, agentMessage];
    });

    // Emit event to update history
    eventBus.emit("conversation-update", {
      assistantId: assistantId,
      conversationId: conversationId,
      lastMessage: {
        content: newMessage.content,
        time: new Date().toISOString(),
        sender: "agent",
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
          sender: "student",
          content: messageWithImage,
          time: Math.floor(Date.now() / 1000),
          invocation_id: "",
        };

        setMessages((prevMessages) => {
          console.log("[Chat] Appending local user file-upload message", {
            conversationId,
            userMessage,
            prevCount: prevMessages.length,
          });
          return [...prevMessages, userMessage];
        });

        // Emit event for user file upload
        eventBus.emit("conversation-update", {
          assistantId: assistantId,
          conversationId: conversationId,
          lastMessage: {
            content: textInput || "[Image uploaded]", // Use text input if provided, otherwise a placeholder
            time: new Date().toISOString(),
            sender: "student",
          },
        });

        // Send message to API
        console.log(
          "handleFileUpload - Calling sendMessage with conversationId:",
          conversationId
        );
        const response = await sendMessage(conversationId, messageWithImage);
        console.log("handleFileUpload - sendMessage response:", response);

        // Agent response will come through WebSocket, no need to handle it here
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
          sender: "student",
          content: messageWithImage,
          time: Math.floor(Date.now() / 1000),
          invocation_id: "",
        };

        setMessages((prevMessages) => {
          console.log("[Chat] Appending local user image message", {
            conversationId,
            userMessage,
            prevCount: prevMessages.length,
          });
          return [...prevMessages, userMessage];
        });

        // Emit event for user message with image
        eventBus.emit("conversation-update", {
          assistantId: assistantId,
          conversationId: conversationId,
          lastMessage: {
            content: content || "[Image uploaded]", // Using the text content without the image for history display
            time: new Date().toISOString(),
            sender: "student",
          },
        });

        // Send message to API
        console.log(
          "handleSendMessageWithImage - Calling sendMessage with conversationId:",
          conversationId
        );
        const response = await sendMessage(conversationId, messageWithImage);
        console.log(
          "handleSendMessageWithImage - sendMessage response:",
          response
        );

        // Agent response will come through WebSocket, no need to handle it here
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
        <div className="flex flex-col flex-1 rounded-lg">
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
        />
        <div className="h-px w-full bg-border/30" />
        <div className="flex flex-col rounded-lg flex-1 chat-messages-container">
          {(() => {
            const safeStudent = conversationData.studentInfo
              ? {
                  id: conversationData.studentInfo.id,
                  name: conversationData.studentInfo.name ?? "",
                  avatar_url: conversationData.studentInfo.avatar_url ?? "",
                }
              : undefined;
            const safeInstructor = conversationData.instructorInfo
              ? {
                  id: conversationData.instructorInfo.id,
                  name: conversationData.instructorInfo.name ?? "",
                  avatar_url: conversationData.instructorInfo.avatar_url ?? "",
                }
              : undefined;
            const safeAssistant = conversationData.assistantInfo
              ? {
                  id: conversationData.assistantInfo.id,
                  name: conversationData.assistantInfo.name ?? "",
                  tagline: conversationData.assistantInfo.tagline ?? "",
                  image: conversationData.assistantInfo.image ?? "",
                }
              : undefined;
            const conversationDataForChatBox = {
              studentInfo: safeStudent,
              instructorInfo: safeInstructor,
              assistantInfo: safeAssistant,
            } as any;
            return (
              <ChatBox
                messages={messages}
                onSendMessageWithImage={handleSendMessageWithImage}
                onFileUpload={handleFileUpload}
                className="h-full border-0 rounded-none shadow-none bg-background"
                name={
                  conversationData.assistantInfo?.name ??
                  assistantInfo?.name ??
                  ""
                }
                avatar_url={
                  conversationData.assistantInfo?.image ??
                  assistantInfo?.image ??
                  ""
                }
                inputRef={inputRef}
                isAgentResponding={isAgentResponding}
                conversationData={conversationDataForChatBox}
                onReply={(p) => setReplyTo(p)}
                replyTo={replyTo}
                onClearReply={() => setReplyTo(null)}
              />
            );
          })()}
        </div>
      </div>
    </ChatProvider>
  );
}
