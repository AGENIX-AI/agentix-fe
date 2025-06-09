import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
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
import { useInstructor } from "@/contexts/InstructorContext";
import { generateTutoringDiscuss } from "@/api/conversations";
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

// Shared tasks array used by both TaskMenu and ChatTasks
const tasks: TaskData[] = [
  {
    id: "create-topic",
    title: "create_topic", // This is now a translation key
    icon: (
      <div className="w-4 h-4 flex items-center justify-center bg-red-50 rounded">
        <Small className="text-red-500 text-xs">🖌️</Small>
      </div>
    ),
  },
];

export function TaskMenu({ onSelectTask }: TaskMenuProps) {
  const { t } = useTranslation();
  return (
    <Card className="w-full absolute bottom-[calc(100%+8px)] left-0 z-20 p-0">
      <CardHeader className="p-3 pb-0 flex flex-col">
        <div className="flex items-center">
          <ClipboardList className="w-4 h-4 mr-2" />
          <CardTitle>{t("chat.tasks.title")}</CardTitle>
        </div>
        <ExtraSmall className="text-muted-foreground pt-2">
          {t("chat.tasks.select_task")}
        </ExtraSmall>
      </CardHeader>

      <Separator className="m-0 w-[calc(100%-24px)] p-0" />
      <CardContent className="p-3 m-0 pt-0">
        <div className="space-y-1">
          {tasks.map((task) => (
            <Button
              key={task.id}
              className="w-full text-left flex items-center gap-2 text-sm cursor-pointer justify-start bg-background "
              onClick={() =>
                onSelectTask(
                  task.id,
                  t(`chat.tasks.${task.id.replace("-", "_")}`)
                )
              }
              variant="ghost"
            >
              {task.icon}
              <ExtraSmall>
                {t(`chat.tasks.${task.id.replace("-", "_")}`)}
              </ExtraSmall>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export interface ChatTasksProps {
  onClose: () => void;
  taskId?: string;
  taskTitle?: string;
}

export function ChatTasks({ onClose, taskId, taskTitle }: ChatTasksProps) {
  const { t } = useTranslation();
  const { conversationId, assistantId } = useInstructor();
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
    default:
      return <TaskMenu onClose={onClose} onSelectTask={handleSelectTask} />;
  }
}
