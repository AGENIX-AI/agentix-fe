import { useEffect, useState, useCallback, memo } from "react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2Icon,
  ListTodo,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { ExtraSmall, H4, P, Small } from "@/components/ui/typography";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStudent } from "@/contexts/StudentContext";
import { getConversationTasks } from "@/api/conversations";

interface ConversationTasksProps {
  className?: string;
}

// Define the new Task interface based on the API response
interface ConversationTask {
  step: number;
  user_task: string;
  agent_task: string;
  status: string;
  success_condition: string;
  hint: string;
  fallback: string;
  checkpoint: string;
  dependencies: number[];
  reward: string;
  goal_id: string;
  id: string;
}

// Helper function to check if tasks have changed

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
    const getStatusIcon = (status: string) => {
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
          <TableCell style={{ width: "10%" }}>
            <Badge className="font-mono">{task.step}</Badge>
          </TableCell>
          <TableCell style={{ width: "70%" }}>
            <div className="flex items-center gap-2 w-full">
              <span className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
              <ExtraSmall className="line-clamp-2 break-words w-full">
                {task.success_condition}
              </ExtraSmall>
            </div>
          </TableCell>
          <TableCell style={{ width: "20%" }}>
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <Small className="capitalize">{status}</Small>
            </div>
          </TableCell>
        </TableRow>
        {isExpanded && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={3} className="p-0 ">
              <div className="p-2 ml-19">
                <div className="mb-3">
                  <ExtraSmall className="font-semibold text-primary">
                    User Task:
                  </ExtraSmall>
                  <ExtraSmall className=" whitespace-pre-line ml-1">
                    {task.user_task}
                  </ExtraSmall>
                </div>
                <div className="mb-3">
                  <ExtraSmall className="font-semibold text-primary">
                    Assistant Task:
                  </ExtraSmall>
                  <ExtraSmall className=" whitespace-pre-line ml-1">
                    {task.agent_task}
                  </ExtraSmall>
                </div>
                {task.hint && (
                  <div className="mb-3">
                    <ExtraSmall className="font-semibold text-primary">
                      Hint:
                    </ExtraSmall>
                    <ExtraSmall className=" whitespace-pre-line ml-1">
                      {task.hint}
                    </ExtraSmall>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.status === nextProps.status &&
      prevProps.task.id === nextProps.task.id &&
      prevProps.task.status === nextProps.task.status &&
      prevProps.task.user_task === nextProps.task.user_task &&
      prevProps.task.agent_task === nextProps.task.agent_task &&
      prevProps.task.step === nextProps.task.step &&
      prevProps.totalTasks === nextProps.totalTasks
    );
  }
);

// Memoized TaskSection component to prevent re-renders

// Main component with optimizations
export const ConversationTasks = memo(
  function ConversationTasks({ className }: ConversationTasksProps) {
    const { conversationInfo, assistantInfo } = useStudent();
    const [isLoading, setIsLoading] = useState(false);
    const [tasks, setTasks] = useState<{
      pending_tasks: ConversationTask[];
      current_task: ConversationTask[];
      completed_tasks: ConversationTask[];
      goal_description: string | null;
      conversation_name: string;
      conversation_description: string;
    } | null>(null);
    // Initialize tasks state
    // Refs to store previous task states for comparison
    // const prevTasksRef = useRef<{
    //   pending_tasks: ConversationTask[];
    //   current_task: ConversationTask[];
    //   completed_tasks: ConversationTask[];
    //   goal_description: string | null;
    //   conversation_name: string;
    //   conversation_description: string;
    // } | null>(null);

    // Function to fetch tasks with optimization to prevent unnecessary updates
    const fetchTasks = useCallback(async () => {
      console.log("Fetching tasks...", conversationInfo);
      if (!conversationInfo?.id) return;

      // Only show loading state on initial load
      if (!tasks) {
        setIsLoading(true);
      }

      try {
        const result = await getConversationTasks(conversationInfo.id);
        if (result.success) {
          // Transform the API response to match our ConversationTask interface
          const newTasks = {
            pending_tasks: result.pending_tasks.map((task: any) => ({
              ...task,
              id: task.id.toString(),
              step: Number(task.step),
              dependencies: Array.isArray(task.dependencies) 
                ? task.dependencies.map((dependency: any) => Number(dependency))
                : [],
            })) as ConversationTask[],
            current_task: result.current_task.map((task: any) => ({
              ...task,
              id: task.id.toString(),
              step: Number(task.step),
              dependencies: Array.isArray(task.dependencies)
                ? task.dependencies.map((dependency: any) => Number(dependency))
                : [],
            })) as ConversationTask[],
            completed_tasks: result.completed_tasks.map((task: any) => ({
              ...task,
              id: task.id.toString(),
              step: Number(task.step),
              dependencies: Array.isArray(task.dependencies)
                ? task.dependencies.map((dependency: any) => Number(dependency))
                : [],
            })) as ConversationTask[],
            goal_description: result.goal_description,
            conversation_name: result.goal_title || "Conversation Tasks",
            conversation_description: result.conversation_description || "",
          };

          setTasks(newTasks);
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
    }, [conversationInfo?.id]);

    // Initial fetch when component mounts or conversation changes
    useEffect(() => {
      fetchTasks();
    }, [fetchTasks]);

    // Set up polling every 5 seconds when the tasks view is visible
    useEffect(() => {
      // Set up interval for polling
      const intervalId = setInterval(() => {
        fetchTasks();
      }, 3000); // Increased polling interval from 3s to 5s to reduce potential jerking

      // Clean up interval on unmount or when visibility changes
      return () => {
        clearInterval(intervalId);
      };
    }, [fetchTasks]);
    if (!assistantInfo) {
      return (
        <div className="h-[calc(100vh)] mt-13 w-full flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2Icon className="h-10 w-10 text-primary animate-spin" />
            <P className="text-muted-foreground text-center">
              Loading Canvas...
            </P>
          </div>
        </div>
      );
    }

    // Check if there are no tasks at all
    if (!tasks || isLoading) {
      return (
        <div className={`${className}`}>
          <div className="p-5">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ListTodo size={48} className="text-muted-foreground mb-4" />
              <H4 className="font-medium mb-2">
                No conversation tasks available
              </H4>
              <P className="text-muted-foreground max-w-md">
                There are currently no tasks for this conversation. Tasks may be
                added as the conversation progresses.
              </P>
            </div>
          </div>
        </div>
      );
    }

    const allTasks = [
      ...tasks.current_task,
      ...tasks.pending_tasks,
      ...tasks.completed_tasks,
    ].sort((a, b) => Number(a.step) - Number(b.step));

    const currentStep = tasks.current_task[0]?.step
      ? Number(tasks.current_task[0].step)
      : allTasks.length > 0
      ? Number(allTasks[0].step)
      : 0;

    return (
      <div className={`${className}`}>
        <div className="p-5 pb-0">
          <div className="space-y-3 mb-6">
            <Small className="font-bold">
              {tasks.conversation_name || "Conversation Tasks"}
            </Small>
            {tasks.conversation_description && (
              <p className="text-sm text-muted-foreground">
                {tasks.conversation_description}
              </p>
            )}
            {tasks.goal_description && (
              <div className="bg-primary/10 border-l-4 border-primary rounded-md p-3">
                <p className="text-sm font-medium">
                  <span className="font-bold block mb-1">Goal:</span>
                  {tasks.goal_description}
                </p>
              </div>
            )}
          </div>
          <Separator className="my-4" />

          <Table className="w-full max-w-full">
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: "10%" }}>Step</TableHead>
                <TableHead style={{ width: "70%" }}>Task Details</TableHead>
                <TableHead style={{ width: "20%" }}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTasks.map((task) => {
                const taskStep = Number(task.step);
                const status =
                  taskStep < currentStep
                    ? "completed"
                    : taskStep === currentStep
                    ? "current"
                    : "pending";

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
