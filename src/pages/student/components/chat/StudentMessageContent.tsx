import { MessageContent } from "@/components/reused/chat/MessageContent";
import { useChatContext } from "@/contexts/ChatContext";
import { MessageCardRenderer as StudentMessageCardRenderer } from "./messageCards/MessageCardRenderer";

interface StudentMessageContentProps {
  content: string;
  messageIndex: number;
  invocation_id: string;
  conversationData?: {
    studentInfo?: {
      id: string;
      name: string;
      avatar_url: string;
    };
    instructorInfo?: {
      id: string;
      name: string;
      avatar_url: string;
    };
    assistantInfo?: {
      id: string;
      name: string;
      tagline: string;
      image: string;
    };
  };
}

export function StudentMessageContent({
  content,
  messageIndex,
  invocation_id,
  conversationData,
}: StudentMessageContentProps) {
  // We need the ChatContext provider to be available, but don't need to use it directly
  useChatContext();

  const renderCard = (card: any, className?: string, invocationId?: string) => {
    return (
      <StudentMessageCardRenderer
        card={card}
        className={className}
        invocation_id={invocationId}
      />
    );
  };

  return (
    <MessageContent
      content={content}
      messageIndex={messageIndex}
      invocation_id={invocation_id}
      conversationData={conversationData}
      renderCard={renderCard}
    />
  );
}
