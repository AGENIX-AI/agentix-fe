import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { useState, type JSX } from "react";
import { CreateTopicForm, type CreateTopicFormData } from "./CreateTopicForm";
import { ExtraSmall, Small } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";

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
    title: "Create a tutoring topic",
    icon: (
      <div className="w-4 h-4 flex items-center justify-center bg-red-50 rounded">
        <Small className="text-red-500 text-xs">🖌️</Small>
      </div>
    ),
  },
];

export function TaskMenu({ onClose, onSelectTask }: TaskMenuProps) {
  console.log(onClose);
  return (
    <Card className="w-full absolute bottom-[calc(100%+8px)] left-0 z-20 p-0">
      <CardHeader className="p-3 pb-0 flex flex-col">
        <div className="flex items-center">
          <ClipboardList className="w-4 h-4 mr-2" />
          <CardTitle>Task</CardTitle>
        </div>
        <ExtraSmall className="text-muted-foreground">
          Select a task to get started
        </ExtraSmall>
      </CardHeader>
      <Separator className="m-0 w-[calc(100%-24px)] mx-3" />
      <CardContent className="p-3 m-0 pt-0">
        <div className="space-y-1">
          {tasks.map((task) => (
            <Button
              key={task.id}
              className="w-full text-left flex items-center gap-2 text-sm cursor-pointer justify-start bg-background "
              onClick={() => onSelectTask(task.id, task.title)}
              variant="ghost"
            >
              {task.icon}
              <ExtraSmall>{task.title}</ExtraSmall>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export interface ChatTasksProps {
  onClose: () => void;
  onSubmitTask: (taskData: any) => void;
  taskId?: string;
  taskTitle?: string;
}

export function ChatTasks({
  onClose,
  onSubmitTask,
  taskId,
  taskTitle,
}: ChatTasksProps) {
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<
    string | undefined
  >(taskTitle);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(
    taskId
  );

  const handleSelectTask = (id: string, title: string) => {
    console.log(id, title);
    setSelectedTaskTitle(title);
    setSelectedTaskId(id);
  };

  const handleSubmitTaskForm = (formData: CreateTopicFormData) => {
    onSubmitTask({
      taskId: selectedTaskId,
      taskTitle: selectedTaskTitle,
      formData,
    });
    onClose();
  };

  if (!selectedTaskTitle) {
    return <TaskMenu onClose={onClose} onSelectTask={handleSelectTask} />;
  }

  // Render the appropriate form based on the selected task ID
  switch (selectedTaskId) {
    case "create-topic":
      return (
        <CreateTopicForm
          onClose={onClose}
          onSubmit={handleSubmitTaskForm}
          taskTitle={selectedTaskTitle}
        />
      );
    default:
      return <TaskMenu onClose={onClose} onSelectTask={handleSelectTask} />;
  }
}
