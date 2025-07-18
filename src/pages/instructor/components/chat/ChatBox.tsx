import { useRef, useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import "./ChatBox.css";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils/cn";
import { useInstructor } from "@/contexts/InstructorContext";
import { TypingIndicator } from "./TypingIndicator";

export interface ChatBoxProps {
  messages?: Array<{
    sender: "agent" | "student" | "instructor";
    content: string;
    time: number;
    invocation_id?: string;
  }>;
  onSendMessageWithImage?: (message: string, imageData: string) => void;
  onFileUpload?: (file: File, textInput?: string) => void;
  className?: string;
  name: string;
  avatar_url?: string;
  inputRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  isAgentResponding?: boolean;
  conversationData?: {
    studentInfo?: { id: string; name: string; avatar_url: string };
    instructorInfo?: { id: string; name: string; avatar_url: string };
    assistantInfo?: {
      id: string;
      name: string;
      tagline: string;
      image: string;
    };
  };
}

export function ChatBox({
  messages = [],
  onSendMessageWithImage,
  onFileUpload,
  className,
  name,
  avatar_url,
  inputRef,
  isAgentResponding,
  conversationData,
}: ChatBoxProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { isChatLoading } = useInstructor();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      // Scroll the container to the end message
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const placeholder = isAgentResponding
    ? "Agent is typing..."
    : "Type your message here...";
  const disabled = isAgentResponding || isChatLoading;
  const typingIndicator = isAgentResponding ? (
    <TypingIndicator avatar_url={avatar_url} name={name} />
  ) : null;

  return (
    <div
      className={cn(
        "flex h-full flex-col border-none bg-background",
        className
      )}
    >
      <div
        ref={messagesContainerRef}
        className="flex flex-1 flex-col overflow-y-auto no-scrollbar chat-scroll-container px-6 mt-3"
      >
        <div className="space-y-3">
          {messages.map((message, index) => {
            // Determine user info based on sender type
            let currentUserName = "";
            let currentUserImage = "";
            let displayName = "";
            let displayImage = "";

            if (message.sender === "instructor") {
              currentUserName =
                conversationData?.instructorInfo?.name ||
                user?.metadata.full_name ||
                "";
              currentUserImage =
                conversationData?.instructorInfo?.avatar_url ||
                user?.metadata.avatar_url ||
                "";
              displayName = currentUserName;
              displayImage = currentUserImage;
            } else if (message.sender === "student") {
              displayName = conversationData?.studentInfo?.name || "Student";
              displayImage = conversationData?.studentInfo?.avatar_url || "";
            } else if (message.sender === "agent") {
              displayName = name;
              displayImage = avatar_url || "";
            }

            return (
              <MessageBubble
                key={index}
                message={message}
                index={index}
                isCurrentUser={message.sender === "instructor"}
                currentUserName={currentUserName}
                currentUserImage={currentUserImage}
                agentName={displayName}
                agentImage={displayImage}
              />
            );
          })}

          {isAgentResponding && typingIndicator}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        onSendMessageWithImage={onSendMessageWithImage}
        onFileUpload={onFileUpload}
        placeholder={placeholder}
        disabled={disabled}
        textareaRef={inputRef}
        className="px-6 py-3"
      />
    </div>
  );
}
