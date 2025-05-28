import { useRef, useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import "./ChatBox.css";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils/cn";

export interface ChatBoxProps {
  messages?: any[];
  onSendMessage?: (message: string) => void;
  onSendMessageWithImage?: (message: string, imageData: string) => void;
  onFileUpload?: (file: File, textInput?: string) => void;
  isLoading?: boolean;
  setIsLoading?: (isLoading: boolean) => void;
  placeholder?: string;
  className?: string;
  name: string;
  avatar_url?: string;
  disabled?: boolean;
  typingIndicator?: React.ReactNode;
  allowImagePaste?: boolean;
  inputRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
}

export function ChatBox({
  messages = [],
  onSendMessage = () => {},
  onSendMessageWithImage,
  onFileUpload,
  isLoading = false,
  setIsLoading,
  placeholder = "Type a message...",
  className,
  name,
  avatar_url,
  disabled = false,
  typingIndicator,
  allowImagePaste = true,
  inputRef,
}: ChatBoxProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      // Scroll the container to the end message
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      className={cn(
        "flex h-full flex-col border-none bg-background",
        className
      )}
    >
      <div
        ref={messagesContainerRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto no-scrollbar chat-scroll-container"
      >
        <div className="space-y-4 pt-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              index={index}
              isCurrentUser={message.sender === "user"}
              currentUserName={user?.metadata.full_name || ""}
              currentUserImage={user?.metadata.avatar_url || ""}
              agentName={name}
              agentImage={avatar_url || ""}
            />
          ))}

          {isLoading && typingIndicator}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        onSendMessage={onSendMessage}
        onSendMessageWithImage={onSendMessageWithImage}
        onFileUpload={onFileUpload}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        placeholder={placeholder}
        disabled={disabled}
        allowImagePaste={allowImagePaste}
        textareaRef={inputRef}
      />
    </div>
  );
}
