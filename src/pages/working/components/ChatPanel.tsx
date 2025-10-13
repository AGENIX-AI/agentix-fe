import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useStudent } from "@/contexts/StudentContext";
import { format } from "date-fns";

interface ChatPanelProps {
  className?: string;
  conversationId?: string;
  isMessagesCollapsed?: boolean;
}

interface Message {
  id: string;
  sender: "student" | "instructor" | "agent";
  content: string;
  timestamp: Date;
  avatar?: string;
  name?: string;
}

const MessageBubble: React.FC<{ message: Message; isOwn: boolean }> = ({
  message,
  isOwn,
}) => {
  return (
    <div className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={message.avatar} />
        <AvatarFallback className="text-xs">
          {message.name?.charAt(0) || message.sender.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col max-w-[70%]", isOwn && "items-end")}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-foreground">
            {message.name || message.sender}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(message.timestamp, "h:mm a")}
          </span>
        </div>

        <div
          className={cn(
            "rounded-lg px-3 py-2 text-sm",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
};

const TypingIndicator: React.FC<{ name?: string; avatar?: string }> = ({
  name,
  avatar,
}) => (
  <div className="flex gap-3">
    <Avatar className="w-8 h-8 flex-shrink-0">
      <AvatarImage src={avatar} />
      <AvatarFallback className="text-xs">
        {name?.charAt(0) || "AI"}
      </AvatarFallback>
    </Avatar>

    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-foreground">
          {name || "Assistant"}
        </span>
        <span className="text-xs text-muted-foreground">typing...</span>
      </div>

      <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
          <div
            className="w-2 h-2 bg-current rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-2 h-2 bg-current rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </div>
    </div>
  </div>
);

export const ChatPanel: React.FC<ChatPanelProps> = ({
  className,
  conversationId,
  isMessagesCollapsed = false,
}) => {
  const { assistantInfo } = useStudent();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock messages for demonstration
  useEffect(() => {
    if (conversationId) {
      setMessages([
        {
          id: "1",
          sender: "agent",
          content: "Hello! How can I help you today?",
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          name: assistantInfo?.name || "AI Assistant",
          avatar: assistantInfo?.image,
        },
        {
          id: "2",
          sender: "student",
          content: "I need help with understanding the project requirements.",
          timestamp: new Date(Date.now() - 1000 * 60 * 3),
          name: "You",
        },
        {
          id: "3",
          sender: "agent",
          content:
            "I'd be happy to help! Could you provide more details about which specific requirements you'd like to understand?",
          timestamp: new Date(Date.now() - 1000 * 60 * 2),
          name: assistantInfo?.name || "AI Assistant",
          avatar: assistantInfo?.image,
        },
      ]);
    }
  }, [conversationId, assistantInfo]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || !conversationId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "student",
      content: inputValue.trim(),
      timestamp: new Date(),
      name: "You",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        content: "Thank you for your message! I'm processing your request...",
        timestamp: new Date(),
        name: assistantInfo?.name || "AI Assistant",
        avatar: assistantInfo?.image,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 2000);
  }, [inputValue, conversationId, assistantInfo]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleFileUpload = useCallback(() => {
    // File upload logic here
    console.log("File upload clicked");
  }, []);

  if (!conversationId) {
    return (
      <div className={cn("flex flex-col h-full bg-background", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Send className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Select a conversation
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose a conversation from the messages panel to start chatting
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border h-20">
        {isMessagesCollapsed ? (
          // Collapsed header - only show icon
          <div className="flex items-center justify-center w-full">
            <Avatar className="w-10 h-10">
              <AvatarImage src={assistantInfo?.image} />
              <AvatarFallback>
                {assistantInfo?.name?.charAt(0) || "AI"}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          // Full header
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={assistantInfo?.image} />
              <AvatarFallback>
                {assistantInfo?.name?.charAt(0) || "AI"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">
                {assistantInfo?.name || "AI Assistant"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {assistantInfo?.tagline || "Always here to help"}
              </p>
            </div>
          </div>
        )}

        {!isMessagesCollapsed && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender === "student"}
          />
        ))}

        {isTyping && (
          <TypingIndicator
            name={assistantInfo?.name || "AI Assistant"}
            avatar={assistantInfo?.image}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      <Separator />

      {/* Input Area */}
      <div className="p-4">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFileUpload}
            className="h-9 w-9 p-0 flex-shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[40px] max-h-[120px] resize-none pr-10"
              rows={1}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            size="sm"
            className="h-9 w-9 p-0 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
