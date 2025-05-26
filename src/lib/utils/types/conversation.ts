export interface LastMessage {
  content: string;
  sender_email: string;
  timestamp: number;
}

export interface ConversationDetails {
  id: string;
  stream_name: string;
  stream_id: string;
  topic_name: string;
  language: string;
  status: number;
  type: number;
  created_at: string;
  updated_at: string;
  last_message?: LastMessage;
}

export interface ConversationListItem {
  id: string;
  name: string;
  image: string;
  tagline: string;
  conversation: ConversationDetails | null;
}
