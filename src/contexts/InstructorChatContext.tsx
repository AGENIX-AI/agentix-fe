import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface ChatContextType {
  handleSendMessage: (content: string) => Promise<void>;
  handleNewMessage: (newMessage: {
    sender: "agent_response" | "user";
    content: string;
    invocation_id: string;
  }) => void;
}

// Create the context with default undefined values
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Custom hook for using the chat context
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

// Provider component
interface ChatProviderProps {
  children: ReactNode;
  handleSendMessage: (content: string) => Promise<void>;
  handleNewMessage: (newMessage: {
    sender: "agent_response" | "user";
    content: string;
    invocation_id: string;
  }) => void;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  handleSendMessage,
  handleNewMessage,
}) => {
  const value = {
    handleSendMessage,
    handleNewMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
