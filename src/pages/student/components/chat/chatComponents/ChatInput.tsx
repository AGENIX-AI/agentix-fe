import { ClipboardList, SendIcon } from "lucide-react";
import { useState, useRef, type ClipboardEvent } from "react";
import { ImageInput } from "./ImageInput";
import { ImagePreview } from "./ImagePreview";
import { TaskMenu, ChatTasks } from "./ChatTasks";
import { useStudent } from "@/contexts/StudentContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendMessageWithImage?: (message: string, imageData: string) => void;
  onFileUpload?: (file: File, textInput?: string) => void;
  isLoading?: boolean;
  setIsLoading?: (isLoading: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  allowImagePaste?: boolean;
  textareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({
  onSendMessage,
  onSendMessageWithImage,
  onFileUpload,
  isLoading = false,
  setIsLoading,
  placeholder = "Type a message...",
  disabled = false,
  allowImagePaste = true,
  textareaRef,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [pastedImageBlob, setPastedImageBlob] = useState<File | null>(null);
  const [showTaskMenu, setShowTaskMenu] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState("");
  const localTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { assistantId } = useStudent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() && !pastedImage && !pastedImageBlob) return;

    if (pastedImageBlob && onFileUpload) {
      // If we have a blob and onFileUpload handler, use that
      onFileUpload(pastedImageBlob, input);
      setPastedImageBlob(null);
      setPastedImage(null);
    } else if (pastedImage && onSendMessageWithImage) {
      // Fallback to the old method if onFileUpload is not available
      onSendMessageWithImage(input, pastedImage);
      setPastedImage(null);
    } else {
      onSendMessage(input);
    }

    setInput("");
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

  const handleTaskFormSubmit = async (formData: any) => {
    if (!assistantId) return;
    console.log(formData);

    try {
      // Set loading state
      if (typeof isLoading === "boolean" && setIsLoading) {
        setIsLoading(true);
      }

      //   const conversation = await createConversationTopic(
      //     assistantId,
      //     formData.formData.type,
      //     formData.formData.topic,
      //     formData.formData.goal,
      //     formData.formData.problems,
      //     formData.formData.language
      //   );
      //   console.log("create topic:", conversation);

      //   setConversationId(conversation.conversation_id);
    } catch (error) {
      console.error("Error creating conversation topic:", error);
    } finally {
      // Reset loading state
      if (typeof isLoading === "boolean" && setIsLoading) {
        setIsLoading(false);
      }
    }
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

  const handleTaskSelect = (taskId: string, taskTitle: string) => {
    setSelectedTask(`${taskId},${taskTitle}`);
    setShowTaskMenu(false);
    setShowTaskForm(true);
  };

  return (
    <div>
      {pastedImage && (
        <ImagePreview imageUrl={pastedImage} onRemove={handleRemoveImage} />
      )}
      <div className="relative flex items-center text-gray-500 hover:text-gray-700 rounded-xl border border-border mt-2">
        {showTaskMenu && (
          <TaskMenu
            onClose={() => setShowTaskMenu(false)}
            onSelectTask={handleTaskSelect}
          />
        )}

        {showTaskForm && (
          <ChatTasks
            onClose={() => setShowTaskForm(false)}
            onSubmitTask={handleTaskFormSubmit}
            taskId={selectedTask.split(",")[0]}
            taskTitle={selectedTask.split(",")[1]}
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

        <Textarea
          ref={textareaRef || localTextareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="min-h-10 max-h-32 border-0 bg-transparent py-3 pl-4 pr-12 text-xs resize-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={disabled}
        />

        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 hover:bg-transparent"
          type="button"
          onClick={handleSubmit}
          disabled={
            isLoading ||
            disabled ||
            (!input.trim() && !pastedImage && !pastedImageBlob)
          }
        >
          <SendIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}
