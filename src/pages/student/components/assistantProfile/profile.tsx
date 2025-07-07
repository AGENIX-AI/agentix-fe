import { Badge } from "@/components/ui/badge";
import { ExtraSmall, Large } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { useStudent } from "@/contexts/StudentContext";
import { useEffect, useState, useCallback } from "react";
import type { Conversation as ConversationType } from "@/services/conversation";
import type { ConversationListResponse } from "@/lib/utils/types/conversation";
import { getConversations } from "@/api/conversations";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";

export function AssistantProfile() {
  const { assistantInfo, setConversationId } = useStudent();
  const [conversationData, setConversationData] =
    useState<ConversationListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  // Function to fetch conversation data
  const fetchConversationData = useCallback(async () => {
    if (!assistantInfo?.id) return;

    setIsLoading(true);
    setHasError(false);

    try {
      const data = await getConversations(assistantInfo.id);
      setConversationData(data);
    } catch (error) {
      console.error("Error fetching conversation data:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [assistantInfo?.id]);

  // Fetch conversation data when assistant ID changes
  useEffect(() => {
    fetchConversationData();
  }, [fetchConversationData]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleConversationClick = (conversation: ConversationType) => {
    setConversationId(conversation.id);
  };

  // Format category name for display
  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "general":
        return "General Topic";
      case "mentor":
        return "Mentoring Topics";
      case "tutorial":
        return "Tutoring Topics";
      case "archived":
        return "Archived Topics";
      default:
        return `${category.charAt(0).toUpperCase() + category.slice(1)} Topics`;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  if (!assistantInfo) return null;

  return (
    <div className="px-6 py-3">
      {/* Profile Header */}
      <div className="flex items-center">
        <div className="flex-1 min-w-0 space-y-3">
          <Large className="font-bold">{assistantInfo.name}</Large>
          <ExtraSmall className="text-muted-foreground block">
            {assistantInfo.tagline}
          </ExtraSmall>
          <div className="flex items-center gap-6">
            <Badge className="flex items-center px-2 py-1">
              <ExtraSmall>{assistantInfo.language}</ExtraSmall>
            </Badge>
            <Badge className="flex items-center px-2 py-1">
              <ExtraSmall>
                Created{" "}
                {new Date(assistantInfo.created_at).toLocaleDateString()}
              </ExtraSmall>
            </Badge>
          </div>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="mb-3">
        <div className="flex items-center gap-6 mb-3">
          <Badge>About</Badge>
        </div>
        <div className="mb-3 flex items-center gap-6">
          <ExtraSmall>{assistantInfo.description}</ExtraSmall>
        </div>
      </div>
      <Separator className="my-3" />

      {/* Capabilities Section */}
      <div className="mb-3">
        <div className="flex items-center gap-6 mb-3">
          <Badge>Capabilities</Badge>
        </div>
        <div className="mb-3 flex items-center gap-6">
          <ExtraSmall className="font-semibold">Specialty:</ExtraSmall>
          <ExtraSmall>
            {assistantInfo?.speciality || "General Assistant"}
          </ExtraSmall>
        </div>
      </div>
      <Separator className="my-3" />

      {/* Topics Section */}
      <div className="mb-3">
        <div className="flex items-center gap-6 mb-3">
          <Badge>Topics</Badge>
        </div>

        {isLoading ? (
          <LoadingState message="Loading topics..." size="small" />
        ) : hasError ? (
          <div className="bg-destructive/10 rounded-md text-center p-4">
            <p className="text-xs text-destructive">
              Failed to load conversation data
            </p>
          </div>
        ) : conversationData ? (
          <div className="space-y-2">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(conversationData.conversations).map(
                  ([category, conversations]) => (
                    <>
                      <TableRow
                        key={category}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleCategory(category)}
                      >
                        <TableCell>
                          {expandedCategories[category] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell>
                          <ExtraSmall className="font-medium">
                            {getCategoryTitle(category)}
                          </ExtraSmall>
                        </TableCell>
                        <TableCell>
                          <ExtraSmall>{conversations.length}</ExtraSmall>
                        </TableCell>
                      </TableRow>
                      {expandedCategories[category] &&
                        conversations.map((conv: ConversationType) => (
                          <TableRow
                            key={conv.id}
                            className="cursor-pointer hover:bg-muted/20 bg-muted/10"
                            onClick={() => handleConversationClick(conv)}
                          >
                            <TableCell></TableCell>
                            <TableCell className=" max-w-0 w-full">
                              <div className="flex flex-col space-y-1">
                                <ExtraSmall className="break-words whitespace-normal">
                                  {conv.conversation_name}
                                </ExtraSmall>
                                <ExtraSmall className="text-muted-foreground break-words whitespace-normal">
                                  Started: {formatDate(conv.created_at)}
                                </ExtraSmall>
                                {category !== "general" &&
                                  conv.goals &&
                                  conv.goals.length > 0 && (
                                    <ExtraSmall className="text-muted-foreground break-words whitespace-normal">
                                      Goal: {conv.goals[0].goal_description}
                                    </ExtraSmall>
                                  )}
                              </div>
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        ))}
                    </>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No topics available
          </div>
        )}
      </div>
    </div>
  );
}
