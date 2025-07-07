// API functions for conversations

import Cookies from "js-cookie";
import * as Sentry from "@sentry/react";

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
    Sentry.captureException(
      new Error(`Failed to create conversation: ${response.statusText}`)
    );
    throw new Error(`Failed to create conversation: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Create the first conversation with an assistant for instructor
 * @param assistantId - The ID of the assistant to create a conversation with
 * @returns The created conversation ID
 */
export const createInstructorFirstConversation = async (
  assistantId: string
): Promise<{ conversation_id: string }> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/conversations/instructor/create_first_conversation/${assistantId}`,
    {
      method: "POST",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(
        `Failed to create instructor conversation: ${response.statusText}`
      )
    );
    throw new Error(
      `Failed to create instructor conversation: ${response.statusText}`
    );
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

  const response = await fetch(
    `${baseUrl}/conversations/get_by_id/${conversationId}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch conversation: ${response.statusText}`)
    );
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
    Sentry.captureException(
      new Error(`Failed to fetch conversation history: ${response.statusText}`)
    );
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
 * Get list of conversations for instructor with pagination and search
 * @param pageNumber - Page number for pagination (default: 1)
 * @param pageSize - Page size for pagination (default: 100)
 * @param sortBy - Sort field (default: "created_at")
 * @param sortOrder - Sort order: 1 for ascending, -1 for descending (default: 1)
 * @param search - Search query (optional)
 * @returns List of conversations with pagination info
 */
export interface InstructorConversationItem {
  id: string | null;
  conversation_name: string | null;
  conversation_description: string | null;
  assistants: {
    id: string;
    name: string;
    tagline: string;
    image: string;
  };
  last_message: any | null;
}

export interface InstructorConversationListResponse {
  success: boolean;
  conversations: InstructorConversationItem[];
  total_items: number;
  page_number: number;
  page_size: number;
}

export const getInstructorListConversations = async (
  pageNumber: number = 1,
  pageSize: number = 100,
  sortBy: string = "created_at",
  sortOrder: number = 1,
  search?: string
): Promise<InstructorConversationListResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  // Build query parameters
  const params = new URLSearchParams({
    page_number: pageNumber.toString(),
    page_size: pageSize.toString(),
    sort_by: sortBy,
    sort_order: sortOrder.toString(),
  });

  if (search) {
    params.append("search", search);
  }

  const response = await fetch(
    `${baseUrl}/conversations/instructor/get_list_conversation?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch instructor conversations list: ${response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Get system assistant conversation
 * @returns System assistant conversation details
 */
export interface SystemAssistantResponse {
  id: string | null;
  conversation_name: string | null;
  conversation_description: string | null;
  assistants: {
    id: string;
    name: string;
    tagline: string;
    image: string;
  };
  last_message: any | null;
}

export const getSystemAssistantConversation =
  async (): Promise<SystemAssistantResponse> => {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(
      `${baseUrl}/conversations/get_system_assistant_conversation`,
      {
        method: "GET",
        credentials: "include",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch system assistant conversation: ${response.statusText}`
      );
    }

    return await response.json();
  };

/**
 * Get paginated list of conversations with filtering and sorting options
 * @param assistantId - The ID of the assistant to filter conversations by
 * @param page - The page number to fetch (starts at 1)
 * @param pageSize - The number of items per page
 * @param sortBy - The field to sort by (e.g., 'created_at')
 * @param sortOrder - The sort order (1 for ascending, -1 for descending)
 * @returns Paginated list of conversations categorized by type
 */
export const getConversations = async (
  assistantId: string,
  page: number = 1,
  pageSize: number = 100,
  sortBy: string = "created_at",
  sortOrder: number = 1
): Promise<
  import("@/lib/utils/types/conversation").ConversationListResponse
> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const url = new URL(`${baseUrl}/conversations/`);
  url.searchParams.append("assistant_id", assistantId);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("page_size", pageSize.toString());
  url.searchParams.append("sort_by", sortBy);
  url.searchParams.append("sort_order", sortOrder.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch conversations: ${response.statusText}`)
    );
    throw new Error(`Failed to fetch conversations: ${response.statusText}`);
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
  invocation_id: string;
}

export const sendMessage = async (
  conversationId: string,
  message: string
): Promise<SendMessageResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/conversations/send_message`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({
      conversation_id: conversationId,
      message,
    }),
  });

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to send message: ${response.statusText}`)
    );
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get tasks for a conversation
 * @param conversationId - The ID of the conversation to fetch tasks for
 * @returns Response with conversation tasks categorized by status
 */
export interface ConversationTasksResponse {
  success: boolean;
  tasks: any[];
  current_task: number;
  conversation_description: string;
  goal_title: string;
  goal_description: string;
}

export const getConversationTasks = async (
  conversationId: string
): Promise<ConversationTasksResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/conversations/get_tasks/${conversationId}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch conversation tasks: ${response.statusText}`)
    );
    throw new Error(
      `Failed to fetch conversation tasks: ${response.statusText}`
    );
  }

  return await response.json();
};

export const getSpeech = async (message: string): Promise<any> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/conversations/get_speech/${message}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch speech: ${response.statusText}`)
    );
    throw new Error(`Failed to fetch speech: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Generate a tutoring discussion based on provided topics, goals, and problems
 * @param data - The data for generating the tutoring discussion
 * @returns Response with the new conversation ID
 */
export interface GenerateTutoringDiscussData {
  topics: string;
  goals: string;
  problems: string;
  language: string;
  conversation_id?: string;
}

export interface GenerateTutoringDiscussResponse {
  sender: "user" | "agent_response";
  new_message: string;
  invocation_id: string;
}

export const generateTutoringDiscuss = async (
  data: GenerateTutoringDiscussData
): Promise<GenerateTutoringDiscussResponse[]> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/conversations/generate_tutoring_discuss`,
    {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(
        `Failed to generate tutoring discussion: ${response.statusText}`
      )
    );
    throw new Error(
      `Failed to generate tutoring discussion: ${response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Refactor a tutoring discussion with updated parameters
 * @param data - The data for refactoring the tutoring discussion
 * @returns Response with the new message content
 */
export interface RefactorTutoringDiscussData {
  conversation_id: string;
  language: string;
  topics: string;
  goals: string;
  problems: string;
}

export interface RefactorTutoringDiscussResponse {
  sender: "user" | "agent_response";
  new_message: string;
  invocation_id: string;
}

export const refactorTutoringDiscuss = async (
  data: RefactorTutoringDiscussData
): Promise<RefactorTutoringDiscussResponse[]> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/conversations/refactor_tutoring_discuss`,
    {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(
        `Failed to refactor tutoring discussion: ${response.statusText}`
      )
    );
    throw new Error(
      `Failed to refactor tutoring discussion: ${response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Create a new topic in a conversation
 * @param data - The data for creating a new topic
 * @returns Response with the new conversation ID
 */
export interface CreateNewTopicData {
  topics: string;
  goals: string;
  problems: string;
  conversation_created_id?: string;
  invocation_id: string;
}

export interface CreateNewTopicResponse {
  conversation_id: string;
}

export const createGenerateTask = async (
  data: CreateNewTopicData
): Promise<CreateNewTopicResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/conversations/create_generate_tasklist_conversation`,
    {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to create new topic: ${response.statusText}`)
    );
    throw new Error(`Failed to create new topic: ${response.statusText}`);
  }

  return await response.json();
};
