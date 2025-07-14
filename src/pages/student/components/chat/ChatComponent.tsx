import { ChatHeader } from "./ChatHeader";
import { Loader2Icon } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatBox } from "./ChatBox";
import { Small, Muted } from "@/components/ui/typography";
import { useStudent } from "@/contexts/StudentContext";
import Cookies from "js-cookie";
import { eventBus } from "@/lib/utils/event/eventBus";
import {
  getConversationHistory,
  sendMessage,
  type UserInfo,
  type AssistantInfo,
} from "@/api/conversations";
import { format } from "date-fns";
import { ChatProvider } from "@/contexts/ChatContext";
import * as Sentry from "@sentry/react";

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
  sender: "student" | "instructor" | "agent";
  content: string;
  time: number;
  invocation_id?: string;
}

// WebSocket message interface
interface WebSocketMessage {
  content: string;
  invocation_id: string;
  sender: "instructor" | "agent";
  conversation_id: string;
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
  const [isAgentResponding, setIsAgentResponding] = useState<boolean>(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [conversationData, setConversationData] = useState<{
    studentInfo?: UserInfo;
    instructorInfo?: UserInfo;
    assistantInfo?: AssistantInfo;
  }>({});
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  console.log(isUploadingFile);

  // WebSocket connection effect
    useEffect(() => {
    const connectWebSocket = () => {
      if (!conversationId) return;

      // Disconnect existing WebSocket if any
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8002";
        // Convert HTTP URL to WebSocket URL (HTTP -> WS, HTTPS -> WSS)
        const wsUrl = baseUrl
          .replace(/^https:\/\//, "wss://")
          .replace(/^http:\/\//, "ws://");
        
        // Get access token from cookies
        const accessToken = Cookies.get("edvara_access_token");
        if (!accessToken) {
          console.error("No access token found in cookies");
          return;
        }

        console.log("Access token found:", accessToken ? "yes" : "no");
        console.log("Token length:", accessToken?.length);

        // Construct WebSocket URL with token parameter
        const websocketUrl = `${wsUrl}/conversations/ws/${conversationId}?token=${encodeURIComponent(accessToken)}`;
        console.log("Attempting WebSocket connection to:", websocketUrl.replace(accessToken, "***TOKEN***"));

        // Create WebSocket with token in query parameter
        const ws = new WebSocket(websocketUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket connected successfully to:", websocketUrl.replace(accessToken, "***TOKEN***"));
          // Send a ping to test the connection
          ws.send("ping");
        };

        ws.onmessage = (event) => {
          try {
            // Handle pong response
            if (event.data === "pong") {
              console.log("WebSocket ping-pong successful");
              return;
            }

            const wsMessage: WebSocketMessage = JSON.parse(event.data);
            console.log("Received WebSocket message:", wsMessage);

            // Only render messages from student or agent
            if (
              wsMessage.sender === "instructor" ||
              wsMessage.sender === "agent"
            ) {
              // Convert timestamp to Unix timestamp
              const timestamp = new Date(wsMessage.timestamp).getTime() / 1000;

              const newMessage: Message = {
                sender: wsMessage.sender,
                content: wsMessage.content,
                time: Math.floor(timestamp),
                invocation_id: wsMessage.invocation_id,
              };

              setMessages((prevMessages) => [...prevMessages, newMessage]);

              // Emit event to update history
              eventBus.emit("conversation-update", {
                assistantId: assistantId,
                conversationId: conversationId,
                lastMessage: {
                  content: wsMessage.content,
                  time: wsMessage.timestamp,
                  sender: wsMessage.sender,
                },
              });

              // If it was an agent response, stop the typing indicator
              if (wsMessage.sender === "agent") {
                setIsAgentResponding(false);
              }
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.onclose = (event) => {
          console.log("WebSocket closed with code:", event.code, "reason:", event.reason);
          
          // Handle specific error codes
          if (event.code === 1008) {
            console.error("WebSocket authentication failed - token may be invalid or expired");
          } else if (event.code === 1011) {
            console.error("WebSocket internal server error");
          }
          
          wsRef.current = null;

          // Attempt to reconnect after a delay if it wasn't a manual close
          if (event.code !== 1000 && conversationId) {
            console.log("Attempting to reconnect WebSocket in 5 seconds...");
            setTimeout(() => {
              connectWebSocket();
            }, 5000);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          wsRef.current = null;
        };

        // Set a timeout to handle connection issues
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            console.error("WebSocket connection timeout");
            ws.close();
          }
        }, 10000); // 10 second timeout

        // Clear timeout when connection opens
        ws.addEventListener('open', () => {
          clearTimeout(connectionTimeout);
        });

      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
      }
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
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
      const response = await getConversationHistory(conversationId);
      setMessages(response.history);
      setConversationData({
        studentInfo: response.student_info,
        instructorInfo: response.instructor_info,
        assistantInfo: response.assistant,
      });
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
      Sentry.captureException(error);
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
        sender: "student",
        content: content,
        time: Math.floor(Date.now() / 1000),
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
          sender: "student",
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

    setMessages((prevMessages) => [...prevMessages, agentMessage]);

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
        sender: "student",
        content: messageWithImage,
        time: Math.floor(Date.now() / 1000),
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
          sender: "student",
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

      // Agent response will come through WebSocket, no need to handle it here
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
              sender: "student",
              content: messageWithImage,
              time: Math.floor(Date.now() / 1000),
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
                sender: "student",
              },
            });

            // Set agent responding state to true to show typing indicator
            setIsAgentResponding(true);

            // Send message to API
            await sendMessage(conversationId, messageWithImage);

            // Agent response will come through WebSocket, no need to handle it here
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
        />
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
            conversationData={conversationData}
          />
        </div>
      </div>
    </ChatProvider>
  );
}
