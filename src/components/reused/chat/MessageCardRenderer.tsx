import { Small } from "@/components/ui/typography";
import { useTranslation } from "react-i18next";

interface MessageCardRendererProps {
  card: any;
  className?: string;
  invocation_id?: string;
  renderCard: (
    card: any,
    className?: string,
    invocation_id?: string
  ) => React.ReactNode;
}

/**
 * A reusable MessageCardRenderer that delegates the actual rendering to the provided renderCard function.
 * This allows both instructor and student views to use their own card rendering logic while
 * maintaining a consistent interface.
 */
export function MessageCardRenderer({
  card,
  className,
  invocation_id,
  renderCard,
}: MessageCardRendererProps) {
  const { t } = useTranslation();

  // If we have a card and a render function, use it
  if (card && renderCard) {
    return renderCard(card, className, invocation_id);
  }

  // Default case - unknown card type
  return (
    <div className="text-sm text-muted-foreground p-2 border rounded-md">
      <Small>
        {t("chat.messageCards.unknownType", "Unknown message card type")}:{" "}
        {card?.type as string}
      </Small>
    </div>
  );
}
