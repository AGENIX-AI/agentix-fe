import { Button } from "@/components/ui/button";
import { useState, type JSX } from "react";
import {
  CreateTopicForm,
  type CreateTopicFormData,
} from "./chatTasks/CreateTopicForm";
import { ExtraSmall, Small } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateTutoringDiscuss } from "@/api/conversations";
import { cn } from "@/lib/utils";
import { useInstructor } from "@/contexts/InstructorContext";
import { useChatContext } from "@/contexts/InstructorChatContext";

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

export function TaskMenu({ onClose }: TaskMenuProps) {
  const { t } = useTranslation();
  const { assistantInfo, setRightPanel } = useInstructor();

  if (assistantInfo?.role === "system") {
    tasks = [
      {
        id: "create-assisstant",
        title: "CREATE YOUR ASSISTANT",
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <span className="text-secondary text-xs">🖌️</span>
          </div>
        ),
      },
    ];
  } else {
    tasks = [
      {
        id: "create-topic",
        title: "CREATE TOPIC",
        icon: (
          <div className="w-4 h-4 flex items-center justify-center bg-accent rounded">
            <Small className="text-accent-foreground text-xs">🖌️</Small>
          </div>
        ),
      },
      {
        id: "modify-assistant",
        title: "MODIFY YOUR ASSISTANT",
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <span className="text-secondary text-xs">✏️</span>
          </div>
        ),
      },
      {
        id: "modify-document",
        title: "MODIFY DOCUMENT",
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <span className="text-secondary text-xs">➕</span>
          </div>
        ),
      },
      {
        id: "modify-image-document",
        title: "MODIFY IMAGE DOCUMENT",
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <span className="text-secondary text-xs">🖼️</span>
          </div>
        ),
      },
    ];
  }
  const handleSelectTask = (id: string) => {
    if (id === "modify-assistant" && setRightPanel) {
      setRightPanel("modifyAssisstant");
      onClose();
      return;
    }

    if (id === "modify-document" && setRightPanel) {
      setRightPanel("modifyDocument");
      onClose();
      return;
    }

    if (id === "modify-image-document" && setRightPanel) {
      setRightPanel("modifyImageDocument");
      onClose();
      return;
    }

    if (id === "create-assisstant" && setRightPanel) {
      setRightPanel("createAssistant");
      onClose();
      return;
    }
  };

  return (
    <div
      className={cn(
        "w-full absolute bottom-[calc(100%+8px)] left-0 z-20 border border-border rounded-xl bg-card shadow-sm transition-all duration-300 ease-in-out font-sans overflow-visible pointer-events-auto"
      )}
      style={
        {
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <div className="rounded-t-xl p-3">
        <div className="text-xs text-primary">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center">
              <Small className="text-primary font-bold">
                {t("chat.tasks.title")}
              </Small>
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
        <div className="space-y-3 mb-3">
          {tasks.map((task) => (
            <Button
              key={task.id}
              className="w-full text-left flex items-center gap-2 text-sm cursor-pointer justify-start bg-muted hover:bg-accent transition-colors border-0 relative z-30"
              onClick={() => {
                handleSelectTask(task.id);
              }}
              variant="ghost"
            >
              {task.icon}
              <ExtraSmall className="text-foreground">{task.title}</ExtraSmall>
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
  const { conversationId, assistantId } = useInstructor();
  const { handleNewMessage } = useChatContext();
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<
    string | undefined
  >(taskTitle);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(
    taskId
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(!!taskId);

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

      if (response.new_message) {
        handleNewMessage({
          sender: "agent_response",
          content: response.new_message,
        });
      }
      setIsModalOpen(false);
      onClose();
    } catch (error) {
      console.error("Error creating tutoring discussion:", error);
      // You might want to add error handling UI here
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (!taskId) {
      setSelectedTaskId(undefined);
      setSelectedTaskTitle(undefined);
    }
  };

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
  }
}
