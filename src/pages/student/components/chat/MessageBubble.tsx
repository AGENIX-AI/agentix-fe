import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlayIcon, StopCircleIcon, Loader2 } from "lucide-react";
import { MessageContent } from "./MessageContent";
import { formatMessageDate, getInitials } from "./utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";
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
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Function to handle playing audio
  const handlePlayAudio = async () => {
    if (!message.invocation_id) return;

    // If the same audio is playing, stop it
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    // If another audio is playing, stop it first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    try {
      setIsAudioLoading(true);

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
      setIsAudioLoading(false);
    } catch (error) {
      console.error("Error fetching or playing audio:", error);
      setIsPlaying(false);
      setIsAudioLoading(false);
    }
  };

  const onPlayButtonClick = () => {
    handlePlayAudio();
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
            disabled={isAudioLoading || !message.invocation_id}
          >
            {isAudioLoading ? (
              <Loader2 className="size-3 text-primary animate-spin" />
            ) : isPlaying ? (
              <StopCircleIcon className="size-3 text-primary" />
            ) : (
              <PlayIcon className="size-3 text-primary" />
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
