import {
  type MessageCard,
  isTopicMessageCard,
  isTutoringTopicMessageCard,
  isLearningDiscussMessageCard,
  isLearningTopicMessageCard,
} from "./types";
import { TopicCard } from "./TopicCard";
import { Small } from "@/components/ui/typography";
import { useChatContext } from "@/contexts/InstructorChatContext";
import { TutoringTopicCard } from "@/pages/instructor/components/chat/messageCards/TutoringTopicCard";
import { LearningDiscussCard } from "./LearningDiscussCard";
import { LearningTopicCard } from "./LearningTopicCard";

interface MessageCardRendererProps {
  card: MessageCard;
  className?: string;
  invocation_id?: string;
}

export function MessageCardRenderer({
  card,
  className,
  invocation_id,
}: MessageCardRendererProps) {
  // Use conditional rendering for different card types
  const { handleNewMessage } = useChatContext();
  if (isLearningTopicMessageCard(card)) {
    return <LearningTopicCard card={card} className={className} />;
  } else if (isTopicMessageCard(card)) {
    return <TopicCard card={card} className={className} />;
  } else if (isTutoringTopicMessageCard(card)) {
    return (
      <TutoringTopicCard
        card={card}
        className={className}
        handleNewMessage={handleNewMessage}
        invocation_id={invocation_id || ""}
      />
    );
  } else if (isLearningDiscussMessageCard(card)) {
    return (
      <LearningDiscussCard
        card={card}
        className={className}
        handleNewMessage={handleNewMessage}
        invocation_id={invocation_id || ""}
      />
    );
  }

  // Default case - unknown card type
  return (
    <div className="text-sm text-muted-foreground p-2 border rounded-md">
      <Small>Unknown message card type: {card.type as string}</Small>
    </div>
  );
}
