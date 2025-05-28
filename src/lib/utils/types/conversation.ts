export interface LastMessage {
  time: string;
  content: string;
  sender: string;
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
}
