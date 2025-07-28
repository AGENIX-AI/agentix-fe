import {
  type MessageCard,
  isTopicMessageCard,
  isTutoringTopicMessageCard,
  isSummaryMessageCard,
} from "./types";
import { TopicCard } from "./TopicCard";
import { TutoringTopicCard } from "./TutoringTopicCard";
import { SummaryCard } from "./SummaryCard";
import { Small } from "@/components/ui/typography";
import { useChatContext } from "@/contexts/ChatContext";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  if (isTopicMessageCard(card)) {
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
  } else if (isSummaryMessageCard(card)) {
    return <SummaryCard card={card} className={className} />;
  }

  // Default case - unknown card type
  return (
    <div className="text-sm text-muted-foreground p-2 border rounded-md">
      <Small>{t("chat.messageCards.unknownType", "Unknown message card type")}: {card.type as string}</Small>
    </div>
  );
}
