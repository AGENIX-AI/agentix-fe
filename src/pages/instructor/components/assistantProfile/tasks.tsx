import { useEffect, useState, useCallback, memo, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2Icon,
  ListTodo,
  Pencil,
} from "lucide-react";
import { ExtraSmall, H4, Large, P } from "@/components/ui/typography";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInstructor } from "@/contexts/InstructorContext";
import { getConversationTasks } from "@/api/conversations";
import { eventBus } from "@/lib/utils/event/eventBus";

interface ConversationTasksProps {
  className?: string;
}

// Define the new Task interface based on the API response
interface ConversationTask {
  step: number;
  // Task type fields
  user_task?: string;
  agent_task?: string;
  success_condition?: string;
  // Q&A type fields
  question?: string;
  answer?: string;
  in_document?: string | null;
  // Common fields
  status?: string; // Now this contains 'not_complete', 'pending', etc. from the API
  dependencies?: number[];
  goal_id?: string;
  id: string;
  conversation_id?: string;
  metadata?: any;
  type?: "task" | "qa"; // We'll add this to distinguish types
}

// Define the structure for the processed tasks data
interface ProcessedTasks {
  pending_tasks: ConversationTask[];
  current_task: ConversationTask[];
  completed_tasks: ConversationTask[];
  goal_description: string | null;
  conversation_name: string;
  conversation_description: string;
  current_step: number;
}

// Helper function to check if tasks have changed
const areTasksEqual = (
  tasksA: ProcessedTasks | null,
  tasksB: ProcessedTasks | null
): boolean => {
  if (!tasksA || !tasksB) return tasksA === tasksB;

  // Compare basic properties
  if (
    tasksA.goal_description !== tasksB.goal_description ||
    tasksA.conversation_name !== tasksB.conversation_name ||
    tasksA.conversation_description !== tasksB.conversation_description ||
    tasksA.current_step !== tasksB.current_step
  ) {
    return false;
  }

  // Compare task arrays
  const compareTaskArrays = (
    arrA: ConversationTask[],
    arrB: ConversationTask[]
  ) => {
    if (arrA.length !== arrB.length) return false;

    // Create a map of tasks by ID for faster comparison
    const taskMapB = new Map(arrB.map((task) => [task.id, task]));

    return arrA.every((taskA) => {
      const taskB = taskMapB.get(taskA.id);
      if (!taskB) return false;

      return (
        taskA.step === taskB.step &&
        taskA.type === taskB.type &&
        taskA.user_task === taskB.user_task &&
        taskA.agent_task === taskB.agent_task &&
        taskA.question === taskB.question &&
        taskA.answer === taskB.answer &&
        taskA.status === taskB.status &&
        taskA.success_condition === taskB.success_condition
      );
    });
  };

  return (
    compareTaskArrays(tasksA.pending_tasks, tasksB.pending_tasks) &&
    compareTaskArrays(tasksA.current_task, tasksB.current_task) &&
    compareTaskArrays(tasksA.completed_tasks, tasksB.completed_tasks)
  );
};

// Memoized TaskCard component to prevent re-renders when props don't change
const TaskCard = memo(
  function TaskCard({
    task,
    status,
  }: {
    task: ConversationTask;
    status: "current" | "pending" | "completed";
    totalTasks: number;
  }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Event-based handleSendMessage that works with eventBus
    const handleSendMessage = useCallback(
      (message: string) => {
        // Emit an event through the eventBus for other components to handle
        eventBus.emit("send-message", {
          content: message,
          source: "tasks",
          taskId: task.id,
          taskStep: task.step,
        });
      },
      [task.id, task.step]
    );
    const getStatusIcon = (status: string, type?: string) => {
      // For Q&A items, we might want different icons
      if (type === "qa") {
        switch (status) {
          case "completed":
            return <CheckCircle className="h-4 w-4 text-green-500" />;
          case "current":
            return <Clock className="h-4 w-4 text-blue-500" />;
          case "pending":
            return <AlertCircle className="h-4 w-4 text-amber-500" />;
          default:
            return <CheckCircle className="h-4 w-4 text-green-500" />; // Q&A items are usually "answered"
        }
      }

      // For task items
      switch (status) {
        case "completed":
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        case "current":
          return <Clock className="h-4 w-4 text-blue-500" />;
        case "pending":
          return <AlertCircle className="h-4 w-4 text-amber-500" />;
        default:
          return null;
      }
    };

    return (
      <>
        <TableRow
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <TableCell style={{ width: "5%" }}>
            <Badge className="font-mono text-xs">{task.step}</Badge>
          </TableCell>
          <TableCell style={{ width: "75%" }}>
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-6 w-full">
                <ExtraSmall
                  className={`line-clamp-2 break-words w-full max-w-[400px] overflow-hidden text-ellipsis ml-4 ${
                    isExpanded ? "whitespace-pre-line" : ""
                  }`}
                >
                  {task.type === "task" ? (
                    <>
                      <ExtraSmall className="font-bold">Goal</ExtraSmall> :{" "}
                      {task.success_condition}
                    </>
                  ) : (
                    <>
                      <ExtraSmall className="font-bold">Question</ExtraSmall> :{" "}
                      {task.question}
                    </>
                  )}
                </ExtraSmall>
              </div>
              {isExpanded && (
                <div className="mt-3 space-y-2 ml-4">
                  {task.type === "task" ? (
                    <>
                      <div className="mb-2">
                        <ExtraSmall className="text-primary whitespace-pre-line line-clamp-3 overflow-hidden text-ellipsis">
                          <ExtraSmall className="font-bold">
                            User Task
                          </ExtraSmall>{" "}
                          : {task.user_task}
                        </ExtraSmall>
                      </div>
                      <div className="mb-2">
                        <ExtraSmall className="text-primary whitespace-pre-line line-clamp-3 overflow-hidden text-ellipsis">
                          <ExtraSmall className="font-bold">
                            Agent Task
                          </ExtraSmall>{" "}
                          : {task.agent_task}
                        </ExtraSmall>
                      </div>
                    </>
                  ) : (
                    <div className="mb-2">
                      <ExtraSmall className="text-primary whitespace-pre-line line-clamp-3 overflow-hidden text-ellipsis">
                        <ExtraSmall className="font-bold">Answer</ExtraSmall> :{" "}
                        {task.answer}
                      </ExtraSmall>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TableCell>
          <TableCell style={{ width: "20%" }}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {getStatusIcon(status, task.type)}
                <ExtraSmall className="capitalize">
                  {task.status || status}
                </ExtraSmall>
              </div>
              {task.type === "qa" &&
                (task.status === "pending" || status === "pending") && (
                  <button
                    className="p-1.5 bg-primary/10 hover:bg-primary/20 rounded text-primary"
                    onClick={() => {
                      handleSendMessage("I want to edit step " + task.step);
                    }}
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                )}
            </div>
          </TableCell>
        </TableRow>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.status === nextProps.status &&
      prevProps.task.id === nextProps.task.id &&
      prevProps.task.status === nextProps.task.status &&
      prevProps.task.type === nextProps.task.type &&
      prevProps.task.user_task === nextProps.task.user_task &&
      prevProps.task.agent_task === nextProps.task.agent_task &&
      prevProps.task.question === nextProps.task.question &&
      prevProps.task.answer === nextProps.task.answer &&
      prevProps.task.step === nextProps.task.step &&
      prevProps.totalTasks === nextProps.totalTasks
    );
  }
);

// Memoized TaskSection component to prevent re-renders

// Main component with optimizations
export const ConversationTasks = memo(
  function ConversationTasks({ className }: ConversationTasksProps) {
    const { conversationId, assistantInfo } = useInstructor();
    const [isLoading, setIsLoading] = useState(true);
    const [tasks, setTasks] = useState<ProcessedTasks | null>(null);
    const tasksRef = useRef<ProcessedTasks | null>(null);
    const [plainTasks, setPlainTasks] = useState<ConversationTask[]>();

    // Function to fetch tasks with optimization to prevent unnecessary updates
    const fetchTasks = useCallback(async () => {
      console.log("ConversationTasks - conversationId:", conversationId);
      if (!conversationId) return;

      // Only show loading state on initial load
      if (!tasksRef.current) {
        setIsLoading(true);
      }
      try {
        const result = await getConversationTasks(conversationId);
        if (result.success) {
          if (plainTasks === result.tasks) return;
          setIsLoading(true);

          // Transform the API response to match our ConversationTask interface
          // Get current_task directly from the API response
          setPlainTasks(result.tasks);
          const currentTaskStep = Number(result.current_task);

          // Process all items from the API response (both tasks and Q&A items)
          console.log("Total items from API:", result.tasks.length);
          console.log("Current task step:", currentTaskStep);

          // Process all items and add type identification
          const processedTasks = result.tasks.map((task: any) => ({
            ...task,
            id: task.id.toString(),
            step: Number(task.step),
            // Identify the type of item
            type: task.user_task && task.agent_task ? "task" : "qa",
            // Only override status for the current task step, otherwise keep the original API status
            // For tasks with step === currentTaskStep, mark as "current" for UI highlighting
            status:
              // If task has status completed, keep it as completed even if it's the current step
              task.status === "completed"
                ? "completed"
                : Number(task.step) === currentTaskStep
                ? "current"
                : task.status ||
                  (Number(task.step) > currentTaskStep
                    ? "pending"
                    : "completed"),
            dependencies: Array.isArray(task.dependencies)
              ? task.dependencies.map((dependency: any) => Number(dependency))
              : [],
          })) as ConversationTask[];

          // Classify items based on their step compared to current_task
          // Now includes both tasks and Q&A items
          const newTasks = {
            pending_tasks: processedTasks.filter(
              (task) => Number(task.step) > currentTaskStep
            ),
            current_task: processedTasks.filter(
              (task) => Number(task.step) === currentTaskStep
            ),
            completed_tasks: processedTasks.filter(
              (task) => Number(task.step) < currentTaskStep
            ),
            goal_description: result.goal_description,
            conversation_name: result.goal_title || "Conversation Tasks",
            conversation_description: result.conversation_description || "",
            current_step: currentTaskStep, // Store the current step value directly
          };

          // Only update state if tasks have actually changed
          if (!tasksRef.current || !areTasksEqual(tasksRef.current, newTasks)) {
            setTasks(newTasks);
          }
        } else {
          console.error("Failed to fetch tasks: API returned success=false");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    }, [conversationId]);

    // Initial fetch when component mounts or conversation changes
    useEffect(() => {
      if (conversationId) {
        console.log("Fetching tasks for conversationId:", conversationId);
        fetchTasks();
      }
    }, [fetchTasks, conversationId]);

    // Update the ref whenever tasks change
    useEffect(() => {
      tasksRef.current = tasks;
    }, [tasks]);

    // Set up polling every 3 seconds when the tasks view is visible
    useEffect(() => {
      // Set up interval for polling
      const intervalId = setInterval(() => {
        fetchTasks();
      }, 3000); // Poll every 3 seconds, but only update if data changed

      // Clean up interval on unmount or when visibility changes
      return () => {
        clearInterval(intervalId);
      };
    }, [fetchTasks]);
    if (!assistantInfo) {
      return (
        <div className="h-[calc(100vh)] mt-13 w-full flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <Loader2Icon className="h-10 w-10 text-primary animate-spin" />
            <P className="text-muted-foreground text-center">
              Loading Canvas...
            </P>
          </div>
        </div>
      );
    }

    // Get all tasks
    const allTasks = tasks
      ? [
          ...tasks.current_task,
          ...tasks.pending_tasks,
          ...tasks.completed_tasks,
        ].sort((a, b) => Number(a.step) - Number(b.step))
      : [];

    // Check if there's no conversationId
    if (!conversationId) {
      return (
        <div className={`${className}`}>
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <ListTodo size={48} className="text-muted-foreground mb-3" />
              <H4 className="font-medium mb-3">No conversation selected</H4>
              <P className="text-muted-foreground max-w-md">
                Please select a conversation from the history panel to view
                tasks.
              </P>
            </div>
          </div>
        </div>
      );
    }

    // Check if there are no tasks at all
    if (!tasks || isLoading || allTasks.length === 0) {
      return (
        <div className={`${className}`}>
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <ListTodo size={48} className="text-muted-foreground mb-3" />
              <H4 className="font-medium mb-3">
                No conversation content available
              </H4>
              <P className="text-muted-foreground max-w-md">
                There is currently no content for this conversation. Tasks and
                Q&A may be added as the conversation progresses.
              </P>
            </div>
          </div>
        </div>
      );
    }

    // allTasks is already defined above

    // Get the current task step from the stored tasks data
    const currentStep = tasks.current_step || 0;

    return (
      <div className={`${className}`}>
        <div className="px-6 py-3">
          <div className="space-y-3">
            <Large className="p-0">
              {tasks.conversation_name || "Conversation Content"}
            </Large>
            {tasks.goal_description && (
              <div className="flex flex-col gap-1 mb-3">
                <ExtraSmall className="font-semibold">Goal:</ExtraSmall>
                <ExtraSmall className="">{tasks.goal_description}</ExtraSmall>
              </div>
            )}
          </div>
          <Separator className="mt-3" />

          <Table className="w-full max-w-full table-fixed overflow-hidden">
            <TableHeader className="text-xs">
              <TableRow>
                <TableHead style={{ width: "5%" }}>Step</TableHead>
                <TableHead style={{ width: "70%" }}>
                  <ExtraSmall className="ml-4">Content</ExtraSmall>
                </TableHead>
                <TableHead style={{ width: "25%" }}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTasks.map((task) => {
                const taskStep = Number(task.step);

                // Determine task status:
                // 1. If task.step === currentStep, status is "current"
                // 2. Otherwise use the task's own status ("pending" or "completed")
                const status =
                  taskStep === currentStep
                    ? "current"
                    : ((task.status || "pending") as "pending" | "completed");

                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    status={status}
                    totalTasks={allTasks.length}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.className === nextProps.className;
  }
);
