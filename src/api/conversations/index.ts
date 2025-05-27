// API functions for conversations

import Cookies from "js-cookie";

// Types for getMessages function
export interface MessageNarrowItem {
  negated: boolean;
  operator: string;
  operand: string | number;
}

export interface GetMessagesParams {
  anchor: string;
  num_before: number;
  num_after: number;
  narrow: MessageNarrowItem[];
  client_gravatar: boolean;
  apply_markdown: boolean;
}

export interface Message {
  id: number;
  sender_id: number;
  content: string;
  recipient_id: number;
  timestamp: number;
  client_id?: string;
  sender_full_name: string;
  sender_email: string;
  sender_realm_str: string;
  subject: string;
  topic_links: any[];
  last_edit_timestamp?: number;
  edit_history?: any[];
  flags?: string[];
  reactions?: any[];
  [key: string]: any;
}

export interface GetMessagesResponse {
  messages: Message[];
  found_newest: boolean;
  found_oldest: boolean;
  found_anchor: boolean;
  [key: string]: any;
}

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const accessToken = Cookies.get("edvara_access_token");
  const refreshToken = Cookies.get("edvara_refresh_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (refreshToken) {
    headers["X-Refresh-Token"] = refreshToken;
  }

  return headers;
};

/**
 * Create the first conversation with an assistant
 * @param assistantId - The ID of the assistant to create a conversation with
 * @returns The created conversation ID
 */
export const createFirstConversation = async (
  assistantId: string
): Promise<{ conversation_id: string }> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/conversations/create_first_conversation/${assistantId}`,
    {
      method: "POST",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create conversation: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get conversation by ID
 * @param conversationId - The ID of the conversation to fetch
 * @returns The conversation details
 */
export const getConversationById = async (
  conversationId: string
): Promise<any> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/conversations/${conversationId}`, {
    method: "GET",
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch conversation: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get chat history for a conversation
 * @param conversationId - The ID of the conversation to fetch history for
 * @returns Array of chat messages with sender, content, and timestamp
 */
export interface ChatMessage {
  sender: "user" | "agent_response";
  content: string;
  time: number;
}

export const getConversationHistory = async (
  conversationId: string
): Promise<ChatMessage[]> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/conversations/get_history_chat/${conversationId}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch conversation history: ${response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Get list of all conversations
 * @returns List of conversations with their details
 */
export interface ConversationListResponse {
  success: boolean;
  conversations: import("@/lib/utils/types/conversation").ConversationListItem[];
}

export const getListConversations =
  async (): Promise<ConversationListResponse> => {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(
      `${baseUrl}/conversations/get_list_conversation`,
      {
        method: "GET",
        credentials: "include",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch conversations list: ${response.statusText}`
      );
    }

    return await response.json();
  };

/**
 * Send a message to a conversation
 * @param conversationId - The ID of the conversation to send the message to
 * @param message - The message content to send
 * @returns Response with success status and agent response
 */
export interface SendMessageResponse {
  success: boolean;
  message: string;
}

export const sendMessage = async (
  conversationId: string,
  message: string
): Promise<SendMessageResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/conversations/send_message`,
    {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({
        conversation_id: conversationId,
        message
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to send message: ${response.statusText}`
    );
  }

  return await response.json();
};
