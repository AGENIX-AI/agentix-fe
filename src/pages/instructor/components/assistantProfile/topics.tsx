import { useInstructor } from "@/contexts/InstructorContext";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { getInstructorConversations } from "@/api/instructor";
import type {
  InstructorConversation,
  GetInstructorConversationsResponse,
} from "@/api/instructor";
// Types
interface Personality {
  id: string;
  voice: string;
  created_at: string;
  mood_style: number;
  assistant_id: string;
  formality_style: number;
  instruction_style: number;
  assertiveness_style: number;
  communication_style: number;
  response_length_style: number;
}

interface CharacterInfo {
  id: string;
  name: string;
  image: string;
  tagline: string;
  description: string;
  speciality: string | null;
  owner_id: string;
  base_stream_name: string | null;
  updated_at: string;
  role: string;
  personality: Personality[];
  language: string;
  created_at: string;
  capability_statement?: {
    speciality: string;
    capabilities: string[];
  };
}

// Using types from conversation service

interface AssistantTopicsProps {
  className?: string;
  initialData?: CharacterInfo | null;
}

// Helper Components
interface ConversationListProps {
  conversationData: GetInstructorConversationsResponse | null;
  isLoading: boolean;
  hasError: boolean;
}

function ConversationList({
  conversationData,
  isLoading,
  hasError,
}: ConversationListProps) {
  return (
    <div>
      {isLoading ? (
        <LoadingState />
      ) : hasError ? (
        <div className="bg-destructive/10 rounded-md text-center">
          <p className="text-xs text-destructive">
            Failed to load conversation data
          </p>
        </div>
      ) : (
        conversationData && (
          <div className="space-y-3 mt-2">
            {Object.entries(conversationData.conversations).map(
              ([category, conversations]) => (
                <ConversationCategory
                  key={category}
                  category={category}
                  conversations={conversations}
                />
              )
            )}
          </div>
        )
      )}
    </div>
  );
}

interface ConversationCategoryProps {
  category: string;
  conversations: InstructorConversation[];
}

function ConversationCategory({
  category,
  conversations,
}: ConversationCategoryProps) {
  const { setConversationId } = useInstructor();

  // Format category name for display
  const getCategoryTitle = () => {
    switch (category) {
      case "general":
        return "General Topics";
      case "training":
        return "Training Topics";
      case "archived":
        return "Archived Topics";
      default:
        return `${category.charAt(0).toUpperCase() + category.slice(1)} Topics`;
    }
  };

  const handleConversationClick = (conversation: InstructorConversation) => {
    setConversationId(conversation.id);
  };

  // Only show add button for mentor and tutorial categories

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  return (
    <>
      <div className="mb-5 h-full">
        <div className="flex items-center mb-2 px-6">
          <h3 className="text-base font-semibold">{getCategoryTitle()}</h3>
        </div>

        {conversations && conversations.length > 0 ? (
          <div className="px-6">
            {conversations.map((conv: InstructorConversation) => (
              <div
                key={conv.id}
                className="hover:bg-muted/10 transition-colors cursor-pointer"
                onClick={() => handleConversationClick(conv)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-10 w-10">
                      <svg
                        fill="var(--accent-foreground)"
                        height="30px"
                        width="30px"
                        version="1.1"
                        id="Capa_1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 60 60"
                      >
                        <g id="SVGRepo_bgCarrier"></g>
                        <g id="SVGRepo_tracerCarrier"></g>
                        <g id="SVGRepo_iconCarrier">
                          <g>
                            <path d="M57.348,0.793H12.652C11.189,0.793,10,1.983,10,3.446v7.347h34.348c2.565,0,4.652,2.087,4.652,4.653v25.347h1.586 L60,50.207V3.446C60,1.983,58.811,0.793,57.348,0.793z"></path>
                            <path d="M44.348,12.793H2.652C1.189,12.793,0,13.983,0,15.446v43.761l9.414-9.414h34.934c1.463,0,2.652-1.19,2.652-2.653V15.446 C47,13.983,45.811,12.793,44.348,12.793z M11,22.793h12c0.553,0,1,0.448,1,1s-0.447,1-1,1H11c-0.553,0-1-0.448-1-1 S10.447,22.793,11,22.793z M36,38.793H11c-0.553,0-1-0.448-1-1s0.447-1,1-1h25c0.553,0,1,0.448,1,1S36.553,38.793,36,38.793z M36,31.793H11c-0.553,0-1-0.448-1-1s0.447-1,1-1h25c0.553,0,1,0.448,1,1S36.553,31.793,36,31.793z"></path>
                          </g>
                        </g>
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 mb-3">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">
                        {conv.conversation_name}
                      </p>
                      <p className="text-xs  mt-1">
                        Started : {formatDate(conv.created_at)}
                      </p>
                      {category !== "general" &&
                        conv.goals &&
                        conv.goals.length > 0 && (
                          <p className="text-xs  mt-1">
                            Goal : {conv.goals[0].goal_description}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-2 px-6 top-0 relative">
            <div className="h-10 w-10">
              <svg
                fill="var(--accent-foreground)"
                height="30px"
                width="30px"
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 60 60"
              >
                <g id="SVGRepo_bgCarrier"></g>
                <g id="SVGRepo_tracerCarrier"></g>
                <g id="SVGRepo_iconCarrier">
                  <g>
                    <path d="M57.348,0.793H12.652C11.189,0.793,10,1.983,10,3.446v7.347h34.348c2.565,0,4.652,2.087,4.652,4.653v25.347h1.586 L60,50.207V3.446C60,1.983,58.811,0.793,57.348,0.793z"></path>
                    <path d="M44.348,12.793H2.652C1.189,12.793,0,13.983,0,15.446v43.761l9.414-9.414h34.934c1.463,0,2.652-1.19,2.652-2.653V15.446 C47,13.983,45.811,12.793,44.348,12.793z M11,22.793h12c0.553,0,1,0.448,1,1s-0.447,1-1,1H11c-0.553,0-1-0.448-1-1 S10.447,22.793,11,22.793z M36,38.793H11c-0.553,0-1-0.448-1-1s0.447-1,1-1h25c0.553,0,1,0.448,1,1S36.553,38.793,36,38.793z M36,31.793H11c-0.553,0-1-0.448-1-1s0.447-1,1-1h25c0.553,0,1,0.448,1,1S36.553,31.793,36,31.793z"></path>
                  </g>
                </g>
              </svg>
            </div>
            <p className="text-sm min-w-0 font-medium">
              No conversations found
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// Main Component
export function AssistantTopics({ className }: AssistantTopicsProps) {
  const { assistantInfo } = useInstructor();
  const [conversationData, setConversationData] =
    useState<GetInstructorConversationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Function to fetch conversation data
  const fetchConversationData = async () => {
    if (!assistantInfo?.id) return;

    setIsLoading(true);
    setHasError(false);

    try {
      const data = await getInstructorConversations({
        assistant_id: assistantInfo.id,
        page_number: 1,
        page_size: 100,
        sort_by: "created_at",
        sort_order: 1,
      });
      setConversationData(data);
    } catch (error) {
      console.error("Error fetching conversation data:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch conversation data when character ID changes
  useEffect(() => {
    fetchConversationData();
  }, [assistantInfo?.id]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchConversationData();
    };

    window.addEventListener("refreshConversations", handleRefresh);

    return () => {
      window.removeEventListener("refreshConversations", handleRefresh);
    };
  }, [fetchConversationData]);

  if (!assistantInfo) {
    return (
      <div className="h-full mt-13 w-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2Icon className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-center">Loading Canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="space-y-6 overflow-y-auto no-scrollbar">
        <ConversationList
          conversationData={conversationData}
          isLoading={isLoading}
          hasError={hasError}
        />
      </div>
    </div>
  );
}
