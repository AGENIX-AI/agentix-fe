import { useRef, useEffect, useState } from "react";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import "./ChatBox.css";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils/cn";
import { getSpeech } from "@/api/conversations";

export interface ChatBoxProps {
  messages?: any[];
  onSendMessage?: (message: string) => void;
  onSendMessageWithImage?: (message: string, imageData: string) => void;
  onFileUpload?: (file: File, textInput?: string) => void;
  isLoading?: boolean;
  setIsLoading?: (isLoading: boolean) => void;
  placeholder?: string;
  className?: string;
  name: string;
  avatar_url?: string;
  disabled?: boolean;
  typingIndicator?: React.ReactNode;
  allowImagePaste?: boolean;
  inputRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
}

export function ChatBox({
  messages = [],
  onSendMessage = () => {},
  onSendMessageWithImage,
  onFileUpload,
  isLoading = false,
  setIsLoading,
  placeholder = "Type a message...",
  className,
  name,
  avatar_url,
  disabled = false,
  typingIndicator,
  allowImagePaste = true,
  inputRef,
}: ChatBoxProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      // Scroll the container to the end message
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Function to handle playing audio
  const handlePlayAudio = async (messageId: string) => {
    // If the same audio is playing, stop it
    if (playingMessageId === messageId && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingMessageId(null);
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
      const response = await getSpeech(messageId);

      // Create audio from base64 data
      const audioData = response.base64;
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audioRef.current = audio;

      // Set up event handlers
      audio.onplay = () => setPlayingMessageId(messageId);
      audio.onended = () => setPlayingMessageId(null);
      audio.onerror = () => {
        setPlayingMessageId(null);
        console.error("Error playing audio");
      };

      // Play the audio
      await audio.play();
      setIsAudioLoading(false);
    } catch (error) {
      console.error("Error fetching or playing audio:", error);
      setPlayingMessageId(null);
      setIsAudioLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col border-none bg-background",
        className
      )}
    >
      <div
        ref={messagesContainerRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto no-scrollbar chat-scroll-container"
      >
        <div className="space-y-4 pt-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              index={index}
              isCurrentUser={message.sender === "user"}
              currentUserName={user?.metadata.full_name || ""}
              currentUserImage={user?.metadata.avatar_url || ""}
              agentName={name}
              agentImage={avatar_url || ""}
              handlePlayAudio={handlePlayAudio}
              isPlaying={playingMessageId === message.invocation_id}
              isAudioLoading={isAudioLoading && playingMessageId === message.invocation_id}
            />
          ))}

          {isLoading && typingIndicator}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        onSendMessage={onSendMessage}
        onSendMessageWithImage={onSendMessageWithImage}
        onFileUpload={onFileUpload}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        placeholder={placeholder}
        disabled={disabled}
        allowImagePaste={allowImagePaste}
        textareaRef={inputRef}
      />
    </div>
  );
}
