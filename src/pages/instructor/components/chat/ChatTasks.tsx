import { Button } from "@/components/ui/button";
import { useState, type JSX } from "react";

import { CreateAssisstantForm } from "./chatTasks/CreateAssisstantForm";
import { CreateLearningTopicForm } from "./chatTasks/CreateLearningTopicForm";
import { ExtraSmall, Large } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { useInstructor } from "@/contexts/InstructorContext";
import { PenLine, Sparkles, Settings, FileText, Brain } from "lucide-react";

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
  const { assistantInfo, setRightPanel, metaData, setMetaData } =
    useInstructor();
  const [isCreateAssistantDialogOpen, setIsCreateAssistantDialogOpen] =
    useState(false);
  const [isCreateLearningTopicDialogOpen, setIsCreateLearningTopicDialogOpen] =
    useState(false);

  if (assistantInfo?.role === "system") {
    tasks = [
      {
        id: "create-assisstant",
        title: t("chat.tasks.create_assistant"),
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
        ),
      },
      {
        id: "create-knowledge-base",
        title: t("chat.tasks.create_knowledge_base"),
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <FileText className="h-4 w-4 text-secondary" />
          </div>
        ),
      },
      {
        id: "create-topic-knowledge",
        title: t("chat.tasks.create_knowledge_component"),
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <Brain className="h-4 w-4 text-secondary" />
          </div>
        ),
      },
    ];
  } else {
    tasks = [
      {
        id: "create-training-topic",
        title: t("chat.tasks.create_training_topic"),
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
        ),
      },
      {
        id: "modify-assistant",
        title: `Modify ${assistantInfo?.name}`,
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <PenLine className="h-4 w-4 text-secondary" />
          </div>
        ),
      },
      {
        id: "manage-knowledge-space",
        title: t("chat.tasks.manage_knowledge_space"),
        icon: (
          <div className="w-4 h-4 flex items-center justify-center rounded">
            <Settings className="h-4 w-4 text-secondary" />
          </div>
        ),
      },
    ];
  }
  const handleSelectTask = (id: string) => {
    if (id === "modify-assistant" && setRightPanel) {
      setRightPanel("assistant-profile");
      setMetaData({
        ...metaData,
        assistantId: assistantInfo?.id,
      });
      onClose();
      return;
    }

    if (id === "manage-knowledge-space" && setRightPanel) {
      setRightPanel("assistant-knowledge");
      setMetaData({
        ...metaData,
        assistantId: assistantInfo?.id,
      });
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

    if (id === "create-training-topic") {
      setIsCreateLearningTopicDialogOpen(true);
      return;
    }

    if (id === "create-knowledge-base") {
      setRightPanel("addDocument");
      onClose();
      return;
    }

    if (id === "create-topic-knowledge") {
      setRightPanel("topicKnowledge");
      onClose();
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
                <Large className="text-primary font-bold">
                  {t("chat.tasks.title")}
                </Large>
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
        taskTitle={t("chat.tasks.create_assistant").toUpperCase()}
      />

      <CreateLearningTopicForm
        open={isCreateLearningTopicDialogOpen}
        onOpenChange={setIsCreateLearningTopicDialogOpen}
        taskTitle={t("chat.tasks.create_training_topic").toUpperCase()}
      />
    </>
  );
}
