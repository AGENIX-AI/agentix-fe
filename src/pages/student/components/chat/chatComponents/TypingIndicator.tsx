import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { getInitials } from "./utils";

interface TypingIndicatorProps {
  avatar_url?: string;
  name?: string;
}

export function TypingIndicator({ avatar_url, name }: TypingIndicatorProps) {
  return (
    <div className="flex items-start flex-col">
      <div className="flex items-center gap-2 mb-1">
        <Avatar className="h-6 w-6">
          <AvatarImage src={avatar_url} alt={name || "Assistant"} />
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
            {getInitials(name || "")}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs font-medium">{name || "Assistant"}</span>
        <span className="text-[10px]">{format(new Date(), "h:mm a")}</span>
      </div>
      <div className="flex max-w-[80%] items-center gap-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm px-4 py-3 text-foreground ml-6">
        <div className="flex space-x-2">
          <div
            className="w-2 h-2 rounded-full bg-primary animate-pulse"
            style={{
              animationDelay: "0ms",
              animationDuration: "1.2s",
            }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-pulse"
            style={{
              animationDelay: "300ms",
              animationDuration: "1.2s",
            }}
          />
          <div
            className="w-2 h-2 rounded-full bg-primary animate-pulse"
            style={{
              animationDelay: "600ms",
              animationDuration: "1.2s",
            }}
          />
        </div>
      </div>
    </div>
  );
}
