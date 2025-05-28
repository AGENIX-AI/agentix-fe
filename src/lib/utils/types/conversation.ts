export interface LastMessage {
  time: string;
  content: string;
  sender: string;
}

export interface Goal {
  goal_title: string;
  goal_description: string;
}

export interface ConversationListItem {
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
  last_message?: LastMessage;
  session_id: string;
  goals: Goal[];
}

export interface ConversationsByCategory {
  general: ConversationListItem[];
  mentor: ConversationListItem[];
  tutorial: ConversationListItem[];
  archived: ConversationListItem[];
}

export interface ConversationListResponse {
  success: boolean;
  conversations: ConversationsByCategory;
  total_items: number;
  page_number: number;
  page_size: number;
}
