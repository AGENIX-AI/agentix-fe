export interface LastMessage {
  time: string;
  content: string;
  sender: string;
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
  conversation_name: string;
  conversation_description: string;
  last_message?: LastMessage;
  assistants: {
    id: string;
    name: string;
    tagline: string;
    image: string;
  };
  name: string;
  tagline: string;
  image: string;
  conversation?: ConversationDetails;
}
