import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlayIcon, StopCircleIcon, Loader2 } from "lucide-react";
import { StudentMessageContent } from "./StudentMessageContent";
import {
  formatMessageDate,
  getInitials,
} from "../../../../lib/utils/message-content-parse";
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
  isSharing?: boolean;
  conversationData?: {
    studentInfo?: { id: string; name: string; avatar_url: string };
    instructorInfo?: { id: string; name: string; avatar_url: string };
    assistantInfo?: {
      id: string;
      name: string;
      tagline: string;
      image: string;
    };
  };
}

export function MessageBubble({
  message,
  index,
  isCurrentUser,
  currentUserName = "",
  currentUserImage = "",
  agentName,
  agentImage,
  isSharing,
  conversationData,
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
        console.error(
          t("chat.message.error_playing_audio", "Error playing audio")
        );
      };

      // Play the audio
      await audio.play();
      setIsAudioLoading(false);
    } catch (error) {
      console.error(
        t(
          "chat.message.error_fetching_audio",
          "Error fetching or playing audio:"
        ),
        error
      );
      setIsPlaying(false);
      setIsAudioLoading(false);
    }
  };

  const onPlayButtonClick = () => {
    handlePlayAudio();
  };

  // Determine the role for display when sharing is enabled
  const getRoleDisplay = () => {
    if (!isSharing) return null;

    if (isCurrentUser) {
      return (
        <span className="text-[10px] ml-1 text-muted-foreground">
          {t("common.student_role", "(Student)")}
        </span>
      );
    } else if (message.sender === "instructor") {
      return (
        <span className="text-[10px] ml-1 text-muted-foreground">
          {t("common.instructor_role", "(Instructor)")}
        </span>
      );
    } else if (message.sender === "agent") {
      return (
        <span className="text-[10px] ml-1 text-muted-foreground">
          {t("common.assistant_role", "(Assistant)")}
        </span>
      );
    }

    return null;
  };

  return (
    <div className={cn("flex flex-col mt-1 items-start")}>
      <div className="flex items-center gap-2">
        {isCurrentUser ? (
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={currentUserImage}
              alt={currentUserName || t("common.student", "Student")}
            />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(currentUserName || t("common.student", "Student"))}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={agentImage}
              alt={agentName || t("common.assistant", "Assistant")}
            />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(agentName || t("common.assistant", "Assistant"))}
            </AvatarFallback>
          </Avatar>
        )}
        <span className="text-xs font-bold flex items-center">
          {isCurrentUser ? currentUserName : agentName}
          {getRoleDisplay()}
        </span>
        <span className="text-[10px]">
          {message.time ? formatMessageDate(message.time) : ""}
        </span>
        {!isCurrentUser && !message.content?.startsWith("MessageCard") && (
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
          "text-xs dark:prose-invert max-w-none variant-attr-cell leading-relaxed chat-message-content ml-8"
        )}
      >
        <StudentMessageContent
          content={message.content}
          messageIndex={index}
          invocation_id={message.invocation_id}
          conversationData={conversationData}
        />
      </div>
    </div>
  );
}
