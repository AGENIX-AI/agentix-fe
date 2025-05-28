export interface LastMessage {
  time: string;
  content: string;
  sender: string;
}

interface Assistant {
  id: string;
  name: string;
  image: string;
  tagline: string;
}
export interface Goal {
  goal_title: string;
  goal_description: string;
}

export interface ConversationListItem {
  id: string;
  conversation_name: string;
  conversation_description: string;
  last_message?: LastMessage;
  assistants: Assistant;
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
