import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { getInitials } from "../../../lib/utils/message-content-parse";
import { useTranslation } from "react-i18next";

interface TypingIndicatorProps {
  avatar_url?: string;
  name?: string;
}

export function TypingIndicator({ avatar_url, name }: TypingIndicatorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-start space-y-1">
      <div className="flex items-center space-x-2">
        <Avatar className="h-6 w-6">
          <AvatarImage
            src={avatar_url}
            alt={name || t("common.assistant", "Assistant")}
          />
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
            {getInitials(name || "")}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs font-medium text-foreground">
          {name || t("common.assistant", "Assistant")}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {format(new Date(), "h:mm a")}
        </span>
      </div>

      <div
        className="ml-7 px-4 py-2.5 rounded-lg border bg-background border-border shadow-sm max-w-[80%]"
        aria-label={t("chat.message.typing")}
      >
        <div className="flex space-x-1.5">
          {[0, 300, 600].map((delay) => (
            <span
              key={delay}
              className="w-2 h-2 rounded-full bg-primary animate-pulse"
              style={{
                animationDelay: `${delay}ms`,
                animationDuration: "1.2s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
