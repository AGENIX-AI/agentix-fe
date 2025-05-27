"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";
import { useState } from "react";
import { MessageContent } from "./MessageContent";
import { formatMessageDate, getInitials } from "./utils";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: any;
  index: number;
  isCurrentUser: boolean;
  currentUserName?: string;
  currentUserImage?: string;
  agentName: string;
  agentImage?: string;
}

export function MessageBubble({
  message,
  index,
  isCurrentUser,
  currentUserName = "",
  currentUserImage = "",
  agentName,
  agentImage,
}: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const speech = new SpeechSynthesisUtterance(message.content);
    speech.lang = "en-US";

    speech.onstart = () => setIsPlaying(true);
    speech.onend = () => setIsPlaying(false);
    speech.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(speech);
  };

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
          {message.timestamp ? formatMessageDate(message.timestamp) : ""}
        </span>
        {!isCurrentUser && (
          <Button
            onClick={handlePlayAudio}
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-primary/20 flex-shrink-0"
            aria-label={isPlaying ? "Stop audio" : "Play audio"}
          >
            <PlayIcon
              className={cn(
                "size-3 text-primary",
                isPlaying && "text-primary/70"
              )}
            />
          </Button>
        )}
      </div>
      <div
        className={cn(
          "text-xs dark:prose-invert max-w-none variant-attr-cell leading-relaxed chat-message-content",
          !isCurrentUser ? "ml-8" : "px-8 py-2 rounded-md"
        )}
      >
        <MessageContent content={message.content} messageIndex={index} />
      </div>
    </div>
  );
}
