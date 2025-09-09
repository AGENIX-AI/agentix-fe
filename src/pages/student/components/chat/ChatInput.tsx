import { ClipboardList, SendIcon } from "lucide-react";
import { useState, useRef, type ClipboardEvent, useEffect } from "react";
import { ImageInput } from "../../../../components/reused/chat/ImageInput";
import { ImagePreview } from "../../../../components/reused/chat/ImagePreview";
import { TaskMenu, ChatTasks } from "./ChatTasks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { useChatContext } from "@/contexts/ChatContext";
import { useStudent } from "@/contexts/StudentContext";
import { useDebouncedLocalStorage } from "@/hooks/useDebouncedLocalStorage";
import type { Conversation } from "@/services/conversation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type UserInfo } from "@/api/conversations";
import "../../../../components/reused/chat/ChatBox.css";

interface ChatInputProps {
  onSendMessageWithImage?: (message: string, imageData: string) => void;
  onFileUpload?: (file: File, textInput?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  allowImagePaste?: boolean;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
  className?: string;
  conversation?: Conversation | null;
  onArchiveComplete?: () => void;
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
  onArchiveComplete,
  conversationData,
}: ChatInputProps) {
  const { t } = useTranslation();
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [pastedImageBlob, setPastedImageBlob] = useState<File | null>(null);
  const [showTaskMenu, setShowTaskMenu] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState("");
  const [showMentionPopover, setShowMentionPopover] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 });
  const localTextareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionPopoverRef = useRef<HTMLDivElement>(null);
  const { handleSendMessage } = useChatContext();
  const { isChatLoading, assistantInfo } = useStudent();

  // Check if conversation is archived
  const isArchived = conversation?.type === "Archived";

  // Create a local state to track the conversation's sharing status
  const [localConversation, setLocalConversation] = useState(conversation);

  // Update local conversation when the prop changes
  useEffect(() => {
    setLocalConversation(conversation);
  }, [conversation]);

  // Generate a storage key based on conversation ID
  const storageKey = `chat-input`;

  // Use debounced localStorage for chat input
  const [input, setInput] = useDebouncedLocalStorage<string>(
    storageKey,
    "",
    500
  );

  // Check if mentions are allowed based on conversation sharing status
  const isMentionsAllowed =
    (conversation?.is_sharing === true ||
      localConversation?.is_sharing === true) &&
    conversationData?.instructorInfo;

  // Find mention at cursor position
  const findMentionAtPosition = (text: string, position: number) => {
    const mentionRegex = /@\[([^\]]+)\]/g;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // Check if cursor is within or adjacent to mention
      if (position >= start && position <= end) {
        return {
          start,
          end,
          text: match[0],
          name: match[1],
        };
      }
    }
    return null;
  };

  // Handle selecting a mention
  const handleSelectMention = () => {
    if (!conversationData?.instructorInfo) return;

    const textarea = textareaRef?.current || localTextareaRef.current;
    if (!textarea) return;

    const instructorName =
      conversationData.instructorInfo.name ||
      t("common.instructor", "Instructor");

    // Replace the @query with the instructor's name in brackets format
    const beforeMention = input.substring(0, mentionPosition.start);
    const afterMention = input.substring(mentionPosition.end);

    // Format: @[name] - simplified format
    const newInput = `${beforeMention}@[${instructorName}]${afterMention}`;
    setInput(newInput);
    setShowMentionPopover(false);

    // Focus back on textarea and place cursor after the mention
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        const newPosition = mentionPosition.start + instructorName.length + 3; // +3 for @[ and ]
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

  // Function to process mentions for backend - extract instructor ID from @[name]
  const processMentionsForBackend = (text: string) => {
    if (!conversationData?.instructorInfo) return text;

    const instructorName =
      conversationData.instructorInfo.name ||
      t("common.instructor", "Instructor");
    const instructorId = conversationData.instructorInfo.id;

    // Replace @[InstructorName] with @instructorId for backend processing
    const mentionPattern = new RegExp(
      `@\\[${instructorName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]`,
      "g"
    );
    return text.replace(mentionPattern, `@${instructorId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isChatLoading || isArchived) return;

    // Check if there's a valid input or image
    if (!input.trim() && !pastedImage && !pastedImageBlob) return;

    // Process the input to handle mentions correctly
    const processedInput = processMentionsForBackend(input);

    // Handle image upload with text
    if (pastedImageBlob && onFileUpload) {
      onFileUpload(pastedImageBlob, processedInput);
      setPastedImageBlob(null);
      setPastedImage(null);
    } else if (pastedImage && onSendMessageWithImage) {
      onSendMessageWithImage(processedInput, pastedImage);
      setPastedImage(null);
    } else {
      handleSendMessage(processedInput);
    }

    // Clear input after sending
    setInput("");

    // Also clear from localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(""));
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!allowImagePaste || isArchived) return;

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
    if (
      !onFileUpload ||
      !e.target.files ||
      e.target.files.length === 0 ||
      isArchived
    )
      return;

    const file = e.target.files[0];
    onFileUpload(file, input);

    // Reset the file input and text input
    e.target.value = "";
    setInput("");
  };

  const handleRemoveImage = () => {
    setPastedImage(null);
    setPastedImageBlob(null);
  };

  const handleTaskClick = () => {
    if (isArchived) return;

    if (showTaskForm) {
      setShowTaskForm(false);
    } else if (showTaskMenu) {
      setShowTaskMenu(false);
    } else {
      setShowTaskMenu(true);
    }
  };

  const handleTaskSelect = (taskId: string, taskTitle: string) => {
    setSelectedTask(`${taskId},${taskTitle}`);
    setShowTaskMenu(false);
    setShowTaskForm(true);
  };

  const handleTaskClose = () => {
    setShowTaskForm(false);
    setShowTaskMenu(false);
  };

  // Function to update conversation sharing status after successful share
  const updateSharingStatus = () => {
    if (localConversation && !localConversation.is_sharing) {
      setLocalConversation({
        ...localConversation,
        is_sharing: true,
      });
    }
  };

  // Listen for custom event when sharing is successful
  useEffect(() => {
    const handleSharingSuccess = () => {
      updateSharingStatus();
    };

    window.addEventListener("conversation-shared", handleSharingSuccess);

    return () => {
      window.removeEventListener("conversation-shared", handleSharingSuccess);
    };
  }, [localConversation]);

  // Determine if input should be disabled
  const inputDisabled = disabled || isArchived;

  // Update highlighting when cursor position changes
  const handleCursorChange = () => {
    const textarea = textareaRef?.current || localTextareaRef.current;
    if (textarea) {
      checkForMentions(input, textarea.selectionStart);
    }
  };

  // Enhanced key handler with atomic mention deletion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle mention deletion first
    if (e.key === "Backspace") {
      // This logic needs to be re-evaluated if atomic deletion is removed
      // For now, keeping it as is, but it might need adjustment
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      const text = textarea.value;

      const mentionRegex = /@\[([^\]]+)\]/g;
      let match;

      while ((match = mentionRegex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        // If cursor is right after a mention, delete the entire mention
        if (cursorPos === end) {
          e.preventDefault();
          const newText = text.slice(0, start) + text.slice(end);
          setInput(newText);

          // Set cursor position after deletion
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start, start);
          }, 0);
          return true;
        }

        // If cursor is inside a mention, delete the entire mention
        if (cursorPos > start && cursorPos <= end) {
          e.preventDefault();
          const newText = text.slice(0, start) + text.slice(end);
          setInput(newText);

          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start, start);
          }, 0);
          return true;
        }
      }
    } else if (e.key === "Delete") {
      // This logic needs to be re-evaluated if atomic deletion is removed
      // For now, keeping it as is, but it might need adjustment
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      const text = textarea.value;

      const mentionRegex = /@\[([^\]]+)\]/g;
      let match;

      while ((match = mentionRegex.exec(text)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        // If cursor is right before a mention, delete the entire mention
        if (cursorPos === start) {
          e.preventDefault();
          const newText = text.slice(0, start) + text.slice(end);
          setInput(newText);

          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start, start);
          }, 0);
          return true;
        }

        // If cursor is inside a mention, delete the entire mention
        if (cursorPos >= start && cursorPos < end) {
          e.preventDefault();
          const newText = text.slice(0, start) + text.slice(end);
          setInput(newText);

          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start, start);
          }, 0);
          return true;
        }
      }
    }

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
    } else if (e.key === "ArrowDown" && showMentionPopover) {
      // Prevent default arrow key behavior when mention popover is open
      e.preventDefault();
    } else if (e.key === "ArrowUp" && showMentionPopover) {
      // Prevent default arrow key behavior when mention popover is open
      e.preventDefault();
    } else if (
      (e.key === "ArrowLeft" || e.key === "ArrowRight") &&
      !showMentionPopover
    ) {
      // Handle cursor navigation around mentions
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      const text = textarea.value;
      const mention = findMentionAtPosition(text, cursorPos);

      if (mention) {
        e.preventDefault();
        if (e.key === "ArrowLeft") {
          // Move cursor to before the mention
          textarea.setSelectionRange(mention.start, mention.start);
        } else {
          // Move cursor to after the mention
          textarea.setSelectionRange(mention.end, mention.end);
        }
      }
    }
  };

  return (
    <div className={className}>
      {pastedImage && (
        <ImagePreview imageUrl={pastedImage} onRemove={handleRemoveImage} />
      )}

      <div className="relative flex items-center rounded-md border border-input bg-background shadow-xs">
        {showTaskMenu && (
          <TaskMenu
            onClose={() => setShowTaskMenu(false)}
            onSelectTask={handleTaskSelect}
            conversation={conversation}
          />
        )}

        {showTaskForm && (
          <ChatTasks
            onClose={handleTaskClose}
            taskId={selectedTask.split(",")[0]}
            taskTitle={selectedTask.split(",")[1]}
            conversation={conversation}
            onArchiveComplete={onArchiveComplete}
          />
        )}

        <Button
          size="icon"
          variant="ghost"
          className="hover:bg-transparent"
          type="button"
          onClick={handleTaskClick}
          disabled={inputDisabled}
        >
          <ClipboardList className="size-4" />
        </Button>

        {onFileUpload && (
          <ImageInput
            onFileChange={handleFileChange}
            disabled={inputDisabled}
          />
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
            onKeyDown={handleKeyDown}
            placeholder={
              isArchived
                ? t(
                    "chat.input.archived_placeholder",
                    "This conversation is archived"
                  )
                : placeholder || t("chat.input.placeholder")
            }
            className="min-h-10 max-h-32 border-0 bg-transparent py-3 pl-4 pr-12 text-xs resize-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none text-foreground"
            rows={1}
            disabled={inputDisabled}
          />

          {/* Mention Popover - only shown if sharing is enabled */}
          {showMentionPopover &&
            isMentionsAllowed &&
            conversationData?.instructorInfo && (
              <div
                ref={mentionPopoverRef}
                className="absolute bottom-full left-0 mb-1 w-64 bg-popover text-popover-foreground border border-border rounded-md shadow-md z-20"
              >
                <div className="p-2 text-xs font-medium text-muted-foreground border-b border-border">
                  Mention user
                </div>
                <div
                  className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer transition-colors"
                  onClick={handleSelectMention}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={conversationData.instructorInfo?.avatar_url}
                      alt={
                        conversationData.instructorInfo?.name ||
                        t("common.instructor", "Instructor")
                      }
                    />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {conversationData.instructorInfo?.name
                        ? conversationData.instructorInfo.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "IN"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {conversationData.instructorInfo?.name ||
                      t("common.instructor", "Instructor")}
                  </span>
                </div>
              </div>
            )}
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 hover:bg-transparent z-10"
          type="button"
          onClick={handleSubmit}
          disabled={
            isChatLoading ||
            inputDisabled ||
            (!input.trim() && !pastedImage && !pastedImageBlob)
          }
        >
          <SendIcon className="size-4" />
        </Button>
      </div>

      <div className="text-[9px] text-center mt-2">
        {assistantInfo?.name || "The assistant"} may be wrong. Please verify.
      </div>
    </div>
  );
}
