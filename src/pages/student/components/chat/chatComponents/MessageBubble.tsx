import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlayIcon, StopCircleIcon } from "lucide-react";
import { useRef, useState } from "react";
import { MessageContent } from "./MessageContent";
import { formatMessageDate, getInitials } from "./utils";
import { cn } from "@/lib/utils";
import { getSpeech } from "@/api/conversations";

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
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = async () => {
    // If already playing, stop the audio
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoading(true);

      // Call the API to get speech data
      const response = await getSpeech(message.invocation_id);

      // Create audio from base64 data
      const audioData = response.base64;
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audioRef.current = audio;

      // Set up event handlers
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        console.error("Error playing audio");
      };

      // Play the audio
      await audio.play();
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching or playing audio:", error);
      setIsPlaying(false);
      setIsLoading(false);
    }
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
            disabled={isLoading}
          >
            {isPlaying ? (
              <StopCircleIcon className="size-3 text-primary" />
            ) : (
              <PlayIcon
                className={cn(
                  "size-3 text-primary",
                  isLoading && "animate-pulse text-primary/70"
                )}
              />
            )}
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
