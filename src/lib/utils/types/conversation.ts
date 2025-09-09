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

export interface ConversationParticipantBrief {
  id: string;
  kind: "user" | "assistant";
  name?: string | null;
  image?: string | null;
}

export interface ConversationListItem {
  id: string | null;
  conversation_name?: string | null;
  conversation_description?: string | null;
  last_message?: LastMessage;
  assistants?: Assistant | null;
  participants?: ConversationParticipantBrief[];
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
