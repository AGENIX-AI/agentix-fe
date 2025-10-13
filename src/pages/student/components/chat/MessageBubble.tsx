import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlayIcon, StopCircleIcon, Loader2 } from "lucide-react";
import { StudentMessageContent } from "./StudentMessageContent";
import { getInitials } from "../../../../lib/utils/message-content-parse";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";
import { getSpeech } from "@/api/conversations";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

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
  // isSharing is currently unused in inline layout, keep for API compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Names/roles are not shown in the inline layout to match Chat Panel

  // Self detection: current user or message.user_id equals authenticated user id
  const { user } = useAuth();
  const isSelf = Boolean(
    isCurrentUser ||
      (message?.user_id && user?.id && message.user_id === user.id)
  );
  // Inline layout doesn't show sender name; keeping alignment only

  // A11y: provide role context in aria-label when sharing is enabled
  const bubbleAriaLabel = isSharing
    ? `${
        isSelf
          ? currentUserName || t("common.student", "Student")
          : agentName || t("common.assistant", "Assistant")
      } message`
    : undefined;

  return (
    <div
      className={cn("flex flex-col mt-3", isSelf ? "items-end" : "items-start")}
    >
      {/* Header for non-self messages: avatar + name + time */}
      {!isSelf && (
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="h-10 w-10 rounded-[12px]">
            <AvatarImage
              src={agentImage}
              alt={agentName || t("common.assistant", "Assistant")}
            />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(agentName || t("common.assistant", "Assistant"))}
            </AvatarFallback>
          </Avatar>
          <span className="text-[12px] font-medium text-foreground/80">
            {agentName || t("common.assistant", "Assistant")}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {format(
              new Date(
                ((message?.time as number) || Math.floor(Date.now() / 1000)) *
                  1000
              ),
              "h:mm a"
            )}
          </span>
        </div>
      )}
      <div
        className={cn(
          "flex items-end gap-2.5 w-full",
          isSelf ? "justify-end" : "justify-start ml-12"
        )}
      >
        {/* Bubble inline with avatar */}
        <div
          className={cn(
            isSelf
              ? "order-1 rounded-[12px] border border-transparent bg-primary text-primary-foreground shadow-sm"
              : "order-none rounded-[12px] border border-border bg-accent/30 text-foreground shadow-sm",
            "inline-block px-4 py-2 text-xs max-w-[75%] sm:max-w-[70%] lg:max-w-[60%] leading-relaxed"
          )}
          aria-label={bubbleAriaLabel}
        >
          <StudentMessageContent
            content={message.content}
            messageIndex={index}
            invocation_id={message.invocation_id}
            conversationData={conversationData}
          />
        </div>

        {isSelf && (
          <Avatar className="h-10 w-10 rounded-[12px] order-2">
            <AvatarImage
              src={currentUserImage}
              alt={currentUserName || t("common.student", "Student")}
            />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {getInitials(currentUserName || t("common.student", "Student"))}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Keep audio control inline for assistant messages */}
        {!isSelf && !message.content?.startsWith("MessageCard") && (
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
    </div>
  );
}
