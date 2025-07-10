import { useState, useEffect, memo, useCallback } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Clock, AlertCircle, ListTodo } from "lucide-react";
import { ExtraSmall, H4, Large, P } from "@/components/ui/typography";
import {
  getStudentSharingTopics,
  getConversationTasks,
} from "@/api/conversations";
import type {
  StudentSharingTopicsResponse,
  StudentSharingConversation,
  ConversationTasksResponse,
} from "@/api/conversations";
import { useInstructor } from "@/contexts/InstructorContext";

// Define the task interface to match the API response
interface SharingTask {
  id: string;
  step: number;
  status: string;
  user_task: string;
  agent_task: string;
  success_condition: string;
  conversation_id: string;
}

// Student Banner Component
function StudentBanner() {
  const [sharingData, setSharingData] =
    useState<StudentSharingTopicsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { metaData } = useInstructor();

  const fetchSharingTopics = useCallback(async () => {
    if (!metaData?.student_id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getStudentSharingTopics(metaData.student_id);
      setSharingData(response);
    } catch (error) {
      console.error("Failed to fetch sharing topics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [metaData?.student_id]);

  useEffect(() => {
    fetchSharingTopics();
  }, [fetchSharingTopics]);

  if (isLoading || !sharingData) {
    return (
      <div className="sticky top-0 z-10 bg-card h-32">
        <LoadingState message="Loading student profile..." size="medium" />
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-10 bg-card">
      {/* Student Info Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16 overflow-hidden">
            <AvatarImage
              src={sharingData.student_info.avatar_url}
              alt={sharingData.student_info.name}
            />
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg truncate">
              {sharingData.student_info.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {sharingData.student_info.email}
            </p>
            <p className="text-xs text-muted-foreground">
              Student - Sharing {sharingData.conversations.length} conversation
              {sharingData.conversations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoized TaskCard component for sharing tasks
const SharingTaskCard = memo(
  function SharingTaskCard({
    task,
    currentTaskStep,
  }: {
    task: SharingTask;
    currentTaskStep: number;
  }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatus = () => {
      if (task.step === currentTaskStep) return "current";
      if (task.step < currentTaskStep) return "completed";
      return "pending";
    };

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

    const status = getStatus();

    return (
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
                <ExtraSmall className="font-bold">Goal</ExtraSmall>:{" "}
                {task.success_condition}
              </ExtraSmall>
            </div>
            {isExpanded && (
              <div className="mt-3 space-y-3 ml-4">
                <div className="mb-2">
                  <ExtraSmall className="text-primary whitespace-pre-line line-clamp-3 overflow-hidden text-ellipsis">
                    <ExtraSmall className="font-bold">
                      Assistant Task
                    </ExtraSmall>
                    : {task.agent_task}
                  </ExtraSmall>
                </div>
                <div className="mb-2">
                  <ExtraSmall className="text-primary whitespace-pre-line line-clamp-3 overflow-hidden text-ellipsis">
                    <ExtraSmall className="font-bold">User Task</ExtraSmall>:{" "}
                    {task.user_task}
                  </ExtraSmall>
                </div>
              </div>
            )}
          </div>
        </TableCell>
        <TableCell style={{ width: "20%" }}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <ExtraSmall className="capitalize">
                {task.status || status}
              </ExtraSmall>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.currentTaskStep === nextProps.currentTaskStep &&
      prevProps.task.id === nextProps.task.id &&
      prevProps.task.status === nextProps.task.status &&
      prevProps.task.step === nextProps.task.step
    );
  }
);

// Sharing Tasks Component
const SharingTasks = memo(function SharingTasks() {
  const [tasks, setTasks] = useState<ConversationTasksResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { conversationId } = useInstructor();

  const fetchTasks = useCallback(async () => {
    if (!conversationId) {
      setError("No conversation selected");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await getConversationTasks(conversationId);
      setTasks(response);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch tasks"
      );
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  if (!conversationId) {
    return (
      <div className="h-[calc(100vh-200px)] w-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <ListTodo size={48} className="text-muted-foreground" />
          <P className="text-muted-foreground text-center">
            Select a conversation to view tasks
          </P>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <LoadingState message="Loading tasks..." size="medium" className="h-32" />
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-200px)] w-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <AlertCircle size={48} className="text-destructive" />
          <P className="text-destructive text-center">{error}</P>
        </div>
      </div>
    );
  }

  if (!tasks || !tasks.tasks || tasks.tasks.length === 0) {
    return (
      <div className="h-[calc(100vh-200px)] w-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <ListTodo size={48} className="text-muted-foreground" />
          <H4 className="font-medium">No tasks available</H4>
          <P className="text-muted-foreground text-center max-w-md">
            No tasks available for this conversation. Tasks may be added as the
            conversation progresses.
          </P>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3">
        <div className="space-y-3">
          {tasks.goal_title && (
            <Large className="p-0">{tasks.goal_title}</Large>
          )}
          {tasks.goal_description && (
            <div className="flex flex-col gap-1 mb-3">
              <ExtraSmall className="font-semibold">Goal:</ExtraSmall>
              <ExtraSmall>{tasks.goal_description}</ExtraSmall>
            </div>
          )}
        </div>
        <Separator className="mt-3" />

        <Table className="w-full max-w-full table-fixed overflow-hidden">
          <TableHeader className="text-xs">
            <TableRow>
              <TableHead style={{ width: "5%" }}>Step</TableHead>
              <TableHead style={{ width: "70%" }}>
                <ExtraSmall className="ml-4">Task Details</ExtraSmall>
              </TableHead>
              <TableHead style={{ width: "25%" }}>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.tasks.map((task: SharingTask) => (
              <SharingTaskCard
                key={task.id}
                task={task}
                currentTaskStep={tasks.current_task}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

// Sharing List Component
function SharingList() {
  const [sharingData, setSharingData] =
    useState<StudentSharingTopicsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { metaData, setConversationId, setAssistantId } = useInstructor();

  const fetchSharingTopics = useCallback(async () => {
    if (!metaData?.student_id) {
      setError("No student ID available");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await getStudentSharingTopics(metaData.student_id);
      setSharingData(response);
    } catch (error) {
      console.error("Failed to fetch sharing topics:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch sharing topics"
      );
    } finally {
      setIsLoading(false);
    }
  }, [metaData?.student_id]);

  useEffect(() => {
    fetchSharingTopics();
  }, [fetchSharingTopics]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <LoadingState
        message="Loading sharing list..."
        size="medium"
        className="h-64"
      />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-destructive text-sm mb-2">
          Error loading sharing list
        </p>
        <p className="text-muted-foreground text-xs">{error}</p>
      </div>
    );
  }

  if (!sharingData || sharingData.conversations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8 text-sm">
        No shared conversations available
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {sharingData.conversations.map(
        (conversation: StudentSharingConversation) => (
          <Card
            key={conversation.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setConversationId(conversation.conversation_id);
              setAssistantId(conversation.conversations.assistants.id);
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium truncate flex-1">
                  {conversation.conversations.conversation_name}
                </CardTitle>
                <Badge
                  variant={getStatusBadgeVariant(conversation.status)}
                  className="ml-2 text-xs"
                >
                  {conversation.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Assistant Info */}
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src={conversation.conversations.assistants.image}
                      alt={conversation.conversations.assistants.name}
                    />
                  </Avatar>
                  <span className="text-xs font-medium">
                    {conversation.conversations.assistants.name}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {conversation.conversations.conversation_description}
                </p>

                {/* Date */}
                <p className="text-xs text-muted-foreground">
                  Shared on {formatDate(conversation.created_at)}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}

// Main Component with Tabs
function SharingTopicsComponent() {
  return (
    <div className="flex flex-col h-full max-h-screen">
      <StudentBanner />

      <div className="overflow-y-auto flex-1 pb-1">
        <Tabs defaultValue="list" className="w-full mt-2">
          <TabsList className="w-full bg-transparent border-none flex gap-2 p-5">
            <TabsTrigger
              value="tasks"
              className="py-4 px-6 data-[state=active]:bg-primary/8 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-muted/50 cursor-pointer transition-colors rounded-md"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="py-4 px-6 data-[state=active]:bg-primary/8 data-[state=active]:text-foreground data-[state=active]:shadow-none hover:bg-muted/50 cursor-pointer transition-colors rounded-md"
            >
              List of Sharing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <SharingTasks />
          </TabsContent>
          <TabsContent value="list">
            <SharingList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export const SharingTopics = memo(SharingTopicsComponent);
