import { Button } from "@/components/ui/button";
import { useState, type JSX } from "react";

import { CreateAssisstantForm } from "./chatTasks/CreateAssisstantForm";
import { CreateLearningTopicForm } from "./chatTasks/CreateLearningTopicForm";
import { ExtraSmall } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { useInstructor } from "@/contexts/InstructorContext";
import { PenLine, Sparkles, Settings, FilePlus } from "lucide-react";

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
  const [isCreateAssistantDialogOpen, setIsCreateAssistantDialogOpen] =
    useState(false);
  const [isCreateLearningTopicDialogOpen, setIsCreateLearningTopicDialogOpen] =
    useState(false);

  if (assistantInfo?.role === "system") {
    tasks = [
      {
        id: "create-assisstant",
        title: "CREATE YOUR ASSISTANT",
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
        ),
      },
    ];
  } else {
    tasks = [
      {
        id: "create-learning-topic",
        title: "CREATE LEARNING TOPIC",
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
        ),
      },
      {
        id: "modify-assistant",
        title: `MODIFY ${assistantInfo?.name.toUpperCase()}`,
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <PenLine className="h-4 w-4 text-secondary" />
          </div>
        ),
      },
      {
        id: "manage-knowledge-space",
        title: "MANAGE KNOWLEDGE SPACE",
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <Settings className="h-4 w-4 text-secondary" />
          </div>
        ),
      },
      {
        id: "add-document",
        title: "ADD DOCUMENT",
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <FilePlus className="h-4 w-4 text-secondary" />
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

    if (id === "manage-knowledge-space" && setRightPanel) {
      setRightPanel("modifyDocument");
      onClose();
      return;
    }

    if (id === "add-document" && setRightPanel) {
      setRightPanel("addDocument");
      onClose();
      return;
    }

    if (id === "create-assisstant") {
      setIsCreateAssistantDialogOpen(true);
      // onClose();
      return;
    }

    if (id === "create-learning-topic") {
      setIsCreateLearningTopicDialogOpen(true);
      return;
    }
  };

  return (
    <>
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
                <ExtraSmall className="text-foreground">
                  {task.title}
                </ExtraSmall>
              </Button>
            ))}
          </div>
        </div>

        {/* Footer - Empty for now, but maintaining structure */}
      </div>

      <CreateAssisstantForm
        open={isCreateAssistantDialogOpen}
        onOpenChange={setIsCreateAssistantDialogOpen}
        taskTitle="CREATE YOUR ASSISTANT"
      />

      <CreateLearningTopicForm
        open={isCreateLearningTopicDialogOpen}
        onOpenChange={setIsCreateLearningTopicDialogOpen}
        taskTitle="CREATE LEARNING TOPIC"
      />
    </>
  );
}
