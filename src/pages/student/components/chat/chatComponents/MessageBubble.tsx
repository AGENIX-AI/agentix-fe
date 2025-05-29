import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlayIcon, StopCircleIcon } from "lucide-react";
import { MessageContent } from "./MessageContent";
import { formatMessageDate, getInitials } from "./utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface MessageBubbleProps {
  message: any;
  index: number;
  isCurrentUser: boolean;
  currentUserName?: string;
  currentUserImage?: string;
  agentName: string;
  agentImage?: string;
  handlePlayAudio?: (messageId: string) => Promise<void>;
  isPlaying?: boolean;
  isAudioLoading?: boolean;
}

export function MessageBubble({
  message,
  index,
  isCurrentUser,
  currentUserName = "",
  currentUserImage = "",
  agentName,
  agentImage,
  handlePlayAudio,
  isPlaying = false,
  isAudioLoading = false,
}: MessageBubbleProps) {
  const { t } = useTranslation();

  const onPlayButtonClick = () => {
    if (handlePlayAudio) {
      handlePlayAudio(message.invocation_id);
    }
  };
  console.log(message);

  return (
    <div className={cn("flex flex-col mt-1 items-start ml-1")}>
      <div className="flex items-center gap-2">
        {isCurrentUser ? (
          <Avatar className="h-6 w-6">
            <AvatarImage src={currentUserImage} alt={currentUserName} />
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {getInitials(currentUserName)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-6 w-6">
            <AvatarImage src={agentImage} alt={agentName} />
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {getInitials(agentName)}
            </AvatarFallback>
          </Avatar>
        )}
        <span className="text-xs font-bold">
          {isCurrentUser ? currentUserName : agentName}
        </span>
        <span className="text-[10px]">
          {message.time ? formatMessageDate(message.time) : ""}
        </span>
        {!isCurrentUser && (
          <Button
            onClick={onPlayButtonClick}
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-primary/20 flex-shrink-0"
            aria-label={
              isPlaying
                ? t("chat.message.stop_audio")
                : t("chat.message.play_audio")
            }
            disabled={isAudioLoading}
          >
            {isPlaying ? (
              <StopCircleIcon className="size-3 text-primary" />
            ) : (
              <PlayIcon
                className={cn(
                  "size-3 text-primary",
                  isAudioLoading && "animate-pulse text-primary/70"
                )}
              />
            )}
          </Button>
        )}
      </div>
      <div
        className={cn(
          "text-xs dark:prose-invert max-w-none variant-attr-cell leading-relaxed chat-message-content",
          !isCurrentUser ? "ml-8" : "px-8 rounded-md"
        )}
      >
        <MessageContent content={message.content} messageIndex={index} />
      </div>
    </div>
  );
}
