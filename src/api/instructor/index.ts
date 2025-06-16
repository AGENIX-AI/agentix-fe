// API functions for instructor data

import Cookies from "js-cookie";

/**
 * Response for creating a learning discussion
 */
export interface CreateLearningDiscussResponse {
  new_message: string;
  invocation_id: string;
}

/**
 * Response for creating and generating tasklist learning
 */
export interface CreateGenerateTasklistLearningResponse {
  conversation_id: string;
}

/**
 * Last message in a conversation
 */
export interface LastMessage {
  time: string | number;
  sender: string;
  content: string;
}

/**
 * Goal for a conversation
 */
export interface ConversationGoal {
  goal_title: string;
  goal_description: string;
}

/**
 * Conversation item in the instructor get conversations response
 */
export interface InstructorConversation {
  id: string;
  assistant_id: string;
  agent_name: string;
  conversation_name: string;
  conversation_description: string;
  type: string;
  language: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  last_message: LastMessage;
  session_id: string;
  current_task: number;
  tasklist_generated: boolean;
  goals: ConversationGoal[];
}

/**
 * Response for getting instructor conversations
 */
export interface GetInstructorConversationsResponse {
  success: boolean;
  conversations: {
    general: InstructorConversation[];
    learning: InstructorConversation[];
    archived: InstructorConversation[];
  };
  total_items: number;
  page_number: number;
  page_size: number;
}

/**
 * Parameters for getting instructor conversations
 */
export interface GetInstructorConversationsParams {
  assistant_id: string;
  page_number: number;
  page_size: number;
  sort_by?: string;
  sort_order?: number;
}

/**
 * Data for creating a learning discussion
 */
export interface CreateLearningDiscussData {
  topics: string;
  focus_on: string;
  conversation_id: string;
}

/**
 * Data for creating and generating tasklist learning
 */
export interface CreateGenerateTasklistLearningData {
  topics: string;
  focus_on: string;
  conversation_created_id?: string;
  invocation_id?: string;
}

export interface InstructorProfile {
  user_id: string;
  instructor_name: string;
  instructor_description: string;
  profile_image: string;
  background_image: string;
  payment_info: string;
  created_at: string;
  updated_at: string;
  id: string;
}

export interface InstructorAssistant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string | null;
  language: string;
}

export interface GetInstructorsResponse {
  instructors: InstructorProfile[];
  total_count: number;
  page_number: number;
  page_size: number;
}

interface GetInstructorsParams {
  page_number: number;
  page_size: number;
  sort_by?: string;
  sort_order?: number;
  search?: string;
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

export const getInstructors = async (
  params: GetInstructorsParams
): Promise<GetInstructorsResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/instructor-profiles/get-instructor?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch instructors: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get instructor profile by ID
 * @param instructorId - The ID of the instructor to fetch
 * @returns The instructor profile
 */
export const getInstructorById = async (
  instructorId: string
): Promise<InstructorProfile> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/instructor-profiles/get-instructor-by-id/${instructorId}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch instructor: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get instructor assistants
 * @param instructorId - The ID of the instructor whose assistants to fetch
 * @returns An array of instructor assistants
 */
export const getInstructorAssistants = async (
  instructorId: string
): Promise<InstructorAssistant[]> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/instructor-profiles/get-instructor-assistants/${instructorId}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch instructor assistants: ${response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Create a learning discussion for an instructor
 * @param data - The data for creating the learning discussion
 * @returns Response with the new message and invocation ID
 */
export const createLearningDiscuss = async (
  data: CreateLearningDiscussData
): Promise<CreateLearningDiscussResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/conversations/instructor/create_learning_discuss`,
    {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to create learning discussion: ${response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Create and generate tasklist learning for an instructor
 * @param data - The data for creating and generating tasklist learning
 * @returns Response with the conversation ID
 */
export const createGenerateTasklistLearning = async (
  data: CreateGenerateTasklistLearningData
): Promise<CreateGenerateTasklistLearningResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/conversations/instructor/create_generate_tasklist_learning`,
    {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to create and generate tasklist learning: ${response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Get conversations for an instructor assistant
 * @param params - Parameters for getting instructor conversations
 * @returns Response with conversations grouped by type
 */
export const getInstructorConversations = async (
  params: GetInstructorConversationsParams
): Promise<GetInstructorConversationsResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(
    `${baseUrl}/conversations/instructor/get_conversations?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch instructor conversations: ${response.statusText}`
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
  invocation_id: string;
}

export const sendInstructorMessage = async (
  conversationId: string,
  message: string
): Promise<SendMessageResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/conversations/instructor/send_message`,
    {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({
        conversation_id: conversationId,
        message,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return await response.json();
};
