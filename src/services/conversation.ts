import api from './api';

// Types
export interface Conversation {
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
  last_message?: {
    time: string;
    sender: string;
    content: string;
  };
  session_id: string;
  goals?: {
    goal_title: string;
    goal_description: string;
  }[];
}

export interface ConversationsByCategory {
  general: Conversation[];
  mentor: Conversation[];
  tutorial: Conversation[];
  archived: Conversation[];
}

export interface ConversationResponse {
  success: boolean;
  conversations: ConversationsByCategory;
  total_items: number;
  page_number: number;
  page_size: number;
}

/**
 * Get conversations by assistant ID
 * @param assistantId - The ID of the assistant
 * @param page - Page number (default: 1)
 * @param pageSize - Number of items per page (default: 100)
 * @param sortBy - Field to sort by (default: created_at)
 * @param sortOrder - Sort order: 1 for ascending, -1 for descending (default: 1)
 * @returns Promise with conversation data
 */
export const getConversationsByAssistantId = async (
  assistantId: string,
  page: number = 1,
  pageSize: number = 100,
  sortBy: string = 'created_at',
  sortOrder: number = 1
): Promise<ConversationResponse> => {
  const response = await api.get(`/conversations`, {
    params: {
      assistant_id: assistantId,
      page,
      page_size: pageSize,
      sort_by: sortBy,
      sort_order: sortOrder
    }
  });
  return response.data;
};
