import { Button } from "@/components/ui/button";
import { useState, type JSX } from "react";
import {
  CreateTopicForm,
  type CreateTopicFormData,
} from "./chatTasks/CreateTopicForm";
import { FeedbackForm, type FeedbackFormData } from "./chatTasks/FeedbackForm";
import { ExtraSmall } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStudent } from "@/contexts/StudentContext";
import { generateTutoringDiscuss } from "@/api/conversations";
import { useChatContext } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { Sparkles, MessageSquare } from "lucide-react";

export interface TaskFormData {
  productName: string;
  targetAudience: string;
  desiredMood: string;
  keyFeatures: string;
}

export interface TaskFormProps {
  onClose: () => void;
  onSubmit: (formData: TaskFormData) => void;
  taskTitle: string;
}

export interface TaskMenuProps {
  onClose: () => void;
  onSelectTask: (taskId: string, taskTitle: string) => void;
}

interface TaskData {
  id: string;
  title: string;
  icon: JSX.Element;
}

// Define tasks variable that will be set conditionally
let tasks: TaskData[];

export function TaskMenu({ onSelectTask }: TaskMenuProps) {
  const { t } = useTranslation();
  const { assistantInfo } = useStudent();

  if (assistantInfo?.role === "system") {
    tasks = [
      {
        id: "feedback",
        title: "feedback", // This is now a translation key
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <MessageSquare className="h-4 w-4 text-secondary" />
          </div>
        ),
      },
    ];
  } else {
    tasks = [
      {
        id: "create-topic",
        title: "create_topic", // This is now a translation key
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
        ),
      },
    ];
  }

  return (
    <div
      className={cn(
        "w-full absolute bottom-[calc(100%+8px)] left-0 z-20 border border-border rounded-xl bg-card shadow-sm transition-all duration-300 ease-in-out font-sans"
      )}
      style={
        {
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div className="rounded-t-xl p-3">
        <div className="text-primary">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center">
              <ExtraSmall className="text-primary font-bold">
                {t("chat.tasks.title")}
              </ExtraSmall>
            </div>
            <ExtraSmall className="text-muted-foreground">
              {t("chat.tasks.select_task")}
            </ExtraSmall>
          </div>
        </div>
        <Separator className="mt-3" />
      </div>

      {/* Content */}
      <div className="px-3">
        <div className="space-y-1 mb-3">
          {tasks.map((task) => (
            <Button
              key={task.id}
              className="w-full text-left flex items-center gap-2 text-sm cursor-pointer justify-start bg-muted hover:bg-accent transition-colors border-0"
              onClick={() =>
                onSelectTask(
                  task.id,
                  t(`chat.tasks.${task.id.replace("-", "_")}`)
                )
              }
              variant="ghost"
            >
              {task.icon}
              <ExtraSmall className="text-foreground">
                {t(`chat.tasks.${task.id.replace("-", "_")}`).toUpperCase()}
              </ExtraSmall>
            </Button>
          ))}
        </div>
      </div>

      {/* Footer - Empty for now, but maintaining structure */}
    </div>
  );
}

export interface ChatTasksProps {
  onClose: () => void;
  taskId?: string;
  taskTitle?: string;
}

export function ChatTasks({ onClose, taskId, taskTitle }: ChatTasksProps) {
  const { t } = useTranslation();
  const { conversationId, assistantId } = useStudent();
  const { handleNewMessage } = useChatContext();
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<
    string | undefined
  >(taskTitle);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(
    taskId
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(!!taskId);

  const handleSelectTask = (id: string) => {
    setSelectedTaskTitle(t(`chat.tasks.${id.replace("-", "_")}`));
    setSelectedTaskId(id);
    setIsModalOpen(true);
  };

  const handleSubmitTaskForm = async (formData: CreateTopicFormData) => {
    try {
      if (!assistantId || !conversationId) return;
      const response = await generateTutoringDiscuss({
        topics: formData.topic,
        goals: formData.goal,
        problems: formData.problems,
        language: formData.language,
        conversation_id: conversationId,
      });

      console.log("Tutoring discussion created:", response);

      if (response) {
        for (const item of response) {
          handleNewMessage({
            sender: item.sender,
            content: item.new_message,
            invocation_id: item.invocation_id,
          });
        }
      }
      setIsModalOpen(false);
      onClose();
    } catch (error) {
      console.error("Error creating tutoring discussion:", error);
      // You might want to add error handling UI here
    }
  };

  const handleSubmitFeedbackForm = (formData: FeedbackFormData) => {
    // This function is passed to FeedbackForm but submission is handled internally
    console.log("Feedback form data:", formData);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (!taskId) {
      setSelectedTaskId(undefined);
      setSelectedTaskTitle(undefined);
    }
  };

  // Only show dialog when a task is selected, otherwise show the task menu
  if (!selectedTaskId) {
    return <TaskMenu onClose={onClose} onSelectTask={handleSelectTask} />;
  }

  // When a task is selected, show the appropriate dialog based on task ID
  switch (selectedTaskId) {
    case "create-topic":
      return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedTaskTitle}</DialogTitle>
            </DialogHeader>
            <CreateTopicForm
              onClose={handleCloseModal}
              onSubmit={handleSubmitTaskForm}
              taskTitle={selectedTaskTitle || ""}
            />
          </DialogContent>
        </Dialog>
      );
    case "feedback":
      return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedTaskTitle}</DialogTitle>
            </DialogHeader>
            <FeedbackForm
              onClose={handleCloseModal}
              onSubmit={handleSubmitFeedbackForm}
              taskTitle={selectedTaskTitle || ""}
            />
          </DialogContent>
        </Dialog>
      );
    default:
      return <TaskMenu onClose={onClose} onSelectTask={handleSelectTask} />;
  }
}
