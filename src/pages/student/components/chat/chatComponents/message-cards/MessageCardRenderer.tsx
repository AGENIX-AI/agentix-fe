import { type MessageCard, isTopicMessageCard } from "./types";
import { TopicCard } from "./TopicCard";
import { Small } from "@/components/ui/typography";

interface MessageCardRendererProps {
  card: MessageCard;
  className?: string;
}

export function MessageCardRenderer({
  card,
  className,
}: MessageCardRendererProps) {
  // Use switch case to render different card types
  if (isTopicMessageCard(card)) {
    return <TopicCard card={card} className={className} />;
  }

  // Default case - unknown card type
  return (
    <div className="text-sm text-muted-foreground p-2 border rounded-md">
      <Small>Unknown message card type: {card.type as string}</Small>
    </div>
  );
}
