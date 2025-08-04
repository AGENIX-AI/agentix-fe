import { ClipboardList, SendIcon } from "lucide-react";
import { useState, useRef, type ClipboardEvent, useEffect } from "react";
import { ImageInput } from "@/components/reused/chat/ImageInput";
import { ImagePreview } from "@/components/reused/chat/ImagePreview";
import { TaskMenu } from "./ChatTasks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { useChatContext } from "@/contexts/InstructorChatContext";
import { useInstructor } from "@/contexts/InstructorContext";
import { useDebouncedLocalStorage } from "@/hooks/useDebouncedLocalStorage";
import type { Conversation } from "@/services/conversation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserInfo {
  id: string;
  name: string;
  avatar_url: string;
}

interface ChatInputProps {
  onSendMessageWithImage?: (message: string, imageData: string) => void;
  onFileUpload?: (file: File, textInput?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  allowImagePaste?: boolean;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  className?: string;
  conversation?: Conversation | null;
  conversationData?: {
    studentInfo?: UserInfo;
    instructorInfo?: UserInfo;
    assistantInfo?: {
      id: string;
      name: string;
      tagline: string;
      image: string;
    };
  };
}

export function ChatInput({
  onSendMessageWithImage,
  onFileUpload,
  placeholder,
  disabled = false,
  allowImagePaste = true,
  textareaRef,
  className,
  conversation,
  conversationData,
}: ChatInputProps) {
  const { t } = useTranslation();
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [pastedImageBlob, setPastedImageBlob] = useState<File | null>(null);
  const [showTaskMenu, setShowTaskMenu] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 });
  const localTextareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionPopoverRef = useRef<HTMLDivElement>(null);
  const { handleSendMessage } = useChatContext();
  const { isChatLoading, assistantInfo } = useInstructor();

  // Storage key for instructor chat input
  const storageKey = `instructor-chat-input`;

  // Use debounced localStorage for chat input
  const [input, setInput] = useDebouncedLocalStorage<string>(
    storageKey,
    "",
    500
  );

  // Check if mentions are allowed - only in Learning Topic conversations with student info
  const isMentionsAllowed =
    conversation?.type === "Tutoring" && conversationData?.studentInfo;

  // Debug log to help troubleshoot
  console.log("Instructor mention check:", {
    conversationType: conversation?.type,
    hasStudentInfo: !!conversationData?.studentInfo,
    isMentionsAllowed,
  });

  // Handle selecting a mention
  const handleSelectMention = () => {
    if (!conversationData?.studentInfo) return;

    const textarea = textareaRef?.current || localTextareaRef.current;
    if (!textarea) return;

    const studentName =
      conversationData.studentInfo.name || t("chat.roles.student");

    // Replace the @query with the student's name in brackets format
    const beforeMention = input.substring(0, mentionPosition.start);
    const afterMention = input.substring(mentionPosition.end);

    // Format: @[name] - simplified format
    const newInput = `${beforeMention}@[${studentName}]${afterMention}`;
    setInput(newInput);
    setShowMentionPopover(false);

    // Focus back on textarea and place cursor after the mention
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newPosition = mentionPosition.start + studentName.length + 3; // +3 for @[ and ]
        textarea.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Check for @ mentions in the input text
  const checkForMentions = (text: string, cursorPosition: number) => {
    // Don't process mentions if not allowed
    if (!isMentionsAllowed) return;

    // Find the last @ symbol before the cursor position
    const lastAtIndex = text.lastIndexOf("@", cursorPosition - 1);

    if (lastAtIndex !== -1) {
      // Check if there's a space or start of text before the @ symbol
      const isValidStart =
        lastAtIndex === 0 || /\s/.test(text[lastAtIndex - 1]);

      if (isValidStart) {
        // Extract the text after @ up to the cursor position
        const query = text.substring(lastAtIndex + 1, cursorPosition);

        // If there's a space after the query or it contains brackets, it's not an active mention
        if (
          !query.includes(" ") &&
          !query.includes("[") &&
          !query.includes("]")
        ) {
          setMentionPosition({ start: lastAtIndex, end: cursorPosition });
          setShowMentionPopover(true);
          return;
        }
      }
    }

    // If we get here, there's no active mention
    setShowMentionPopover(false);
  };

  // Handle input change with mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);

    // Check for mentions when typing
    checkForMentions(newValue, e.target.selectionStart);
  };

  // Close mention popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionPopoverRef.current &&
        !mentionPopoverRef.current.contains(event.target as Node)
      ) {
        setShowMentionPopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to process mentions for backend - extract student ID from @[name]
  const processMentionsForBackend = (text: string) => {
    if (!conversationData?.studentInfo) return text;

    const studentName =
      conversationData.studentInfo.name || t("chat.roles.student");
    const studentId = conversationData.studentInfo.id;

    // Replace @[StudentName] with @studentId for backend processing
    const mentionPattern = new RegExp(
      `@\\[${studentName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]`,
      "g"
    );
    return text.replace(mentionPattern, `@${studentId}`);
  };

  // Handle cursor and key events
  const handleCursorChange = () => {
    const textarea = textareaRef?.current || localTextareaRef.current;
    if (textarea) {
      checkForMentions(input, textarea.selectionStart);
    }
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent Enter from sending message when mention popover is open
    if (e.key === "Enter" && !e.shiftKey) {
      if (showMentionPopover) {
        // If mention popover is showing, select the mention instead of sending
        e.preventDefault();
        handleSelectMention();
        return;
      }
      // Otherwise, submit the message
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === "Escape") {
      setShowMentionPopover(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() && !pastedImage && !pastedImageBlob) return;

    // Process the input to handle mentions correctly
    const processedInput = processMentionsForBackend(input);

    if (pastedImageBlob && onFileUpload) {
      // If we have a blob and onFileUpload handler, use that
      onFileUpload(pastedImageBlob, processedInput);
      setPastedImageBlob(null);
      setPastedImage(null);
    } else if (pastedImage && onSendMessageWithImage) {
      // Fallback to the old method if onFileUpload is not available
      onSendMessageWithImage(processedInput, pastedImage);
      setPastedImage(null);
    } else {
      handleSendMessage(processedInput);
    }

    // Clear input after sending
    setInput("");

    // Also clear from localStorage to prevent showing it again
    try {
      localStorage.setItem(storageKey, JSON.stringify(""));
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!allowImagePaste) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (!blob) continue;

        // Store the blob for upload
        setPastedImageBlob(blob);

        // Also create a preview
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPastedImage(event.target.result as string);
          }
        };
        reader.readAsDataURL(blob);

        // Prevent default paste behavior for images
        e.preventDefault();
        break;
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onFileUpload || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    onFileUpload(file, input);

    // Reset the file input
    e.target.value = "";
    // Reset the text input after uploading
    setInput("");
  };

  const handleRemoveImage = () => {
    setPastedImage(null);
    setPastedImageBlob(null);
  };

  const handleTaskClick = () => {
    if (showTaskForm) {
      setShowTaskForm(false);
    } else if (showTaskMenu) {
      setShowTaskMenu(false);
    } else {
      setShowTaskMenu(true);
    }
  };

  const handleTaskSelect = () => {
    setShowTaskMenu(false);
    setShowTaskForm(true);
  };

  return (
    <div className={className}>
      {pastedImage && (
        <ImagePreview imageUrl={pastedImage} onRemove={handleRemoveImage} />
      )}

      <div className="relative flex items-center text-gray-500 hover:text-gray-700 rounded-xl border border-border">
        {showTaskMenu && (
          <TaskMenu
            onClose={() => setShowTaskMenu(false)}
            onSelectTask={handleTaskSelect}
          />
        )}

        <Button
          size="icon"
          variant="ghost"
          className="hover:bg-transparent"
          type="button"
          onClick={handleTaskClick}
        >
          <ClipboardList className="size-4" />
        </Button>

        {onFileUpload && (
          <ImageInput onFileChange={handleFileChange} disabled={disabled} />
        )}

        <div className="relative flex-1 chat-input-container">
          <Textarea
            ref={textareaRef || localTextareaRef}
            value={input}
            onChange={handleInputChange}
            onPaste={handlePaste}
            onClick={handleCursorChange}
            onKeyUp={handleCursorChange}
            onMouseUp={handleCursorChange}
            placeholder={placeholder || t("chat.input.placeholder")}
            className="min-h-10 max-h-32 border-0 bg-transparent py-3 pl-4 pr-12 text-xs resize-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none text-foreground"
            rows={1}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />

          {/* Mention Popover - only shown for Learning Topic conversations with students */}
          {showMentionPopover &&
            isMentionsAllowed &&
            conversationData?.studentInfo && (
              <div
                ref={mentionPopoverRef}
                className="absolute bottom-full left-0 mb-1 w-64 bg-white dark:bg-gray-900 border border-border rounded-md shadow-lg z-20"
              >
                <div className="p-2 text-xs font-medium text-muted-foreground border-b border-border">
                  {t("chat.input.mention_student")}
                </div>
                <div
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors"
                  onClick={handleSelectMention}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={conversationData.studentInfo?.avatar_url}
                      alt={
                        conversationData.studentInfo?.name ||
                        t("chat.roles.student")
                      }
                    />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {conversationData.studentInfo?.name
                        ? conversationData.studentInfo.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : t("chat.roles.student_initials")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {conversationData.studentInfo?.name ||
                      t("chat.roles.student")}
                  </span>
                </div>
              </div>
            )}
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 hover:bg-transparent"
          type="button"
          onClick={handleSubmit}
          disabled={
            isChatLoading ||
            disabled ||
            (!input.trim() && !pastedImage && !pastedImageBlob)
          }
        >
          <SendIcon className="size-4" />
        </Button>
      </div>
      <div className="text-[9px] text-center mt-2">
        {t("chat.assistant.verification_warning", {
          name: assistantInfo?.name || t("chat.roles.assistant_the"),
        })}
      </div>
    </div>
  );
}
