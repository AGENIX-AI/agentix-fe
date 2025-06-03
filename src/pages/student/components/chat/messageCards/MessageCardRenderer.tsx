import {
  type MessageCard,
  isTopicMessageCard,
  isTutoringTopicMessageCard,
} from "./types";
import { TopicCard } from "./TopicCard";
import { TutoringTopicCard } from "./TutoringTopicCard";
import { Small } from "@/components/ui/typography";
import { useChatContext } from "@/contexts/ChatContext";

interface MessageCardRendererProps {
  card: MessageCard;
  className?: string;
}

export function MessageCardRenderer({
  card,
  className,
}: MessageCardRendererProps) {
  // Use conditional rendering for different card types
  const { handleNewMessage } = useChatContext();
  if (isTopicMessageCard(card)) {
    return <TopicCard card={card} className={className} />;
  } else if (isTutoringTopicMessageCard(card)) {
    return (
      <TutoringTopicCard
        card={card}
        className={className}
        handleNewMessage={handleNewMessage}
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
