import { ExtraSmall, Large } from "@/components/ui/typography";
import { useStudent } from "@/contexts/StudentContext";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        return "Private Topics";
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
    <div className="px-6 py-3 space-y-3">
      {/* Assistant Basic Info */}
      <div className="space-y-2">
        <Large className="font-bold">{assistantInfo.name}</Large>
        <ExtraSmall className="text-muted-foreground">
          {assistantInfo.tagline}
        </ExtraSmall>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{assistantInfo.language}</span>
          <span>•</span>
          <span>
            Created {new Date(assistantInfo.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <ExtraSmall className="font-semibold text-foreground">
          {t("student.assistantProfile.about")}:{" "}
        </ExtraSmall>
        <ExtraSmall className="">{assistantInfo.description}</ExtraSmall>
      </div>

      {/* Specialty */}
      <div className="space-y-1">
        <ExtraSmall className="font-semibold text-foreground">
          {t("student.assistantProfile.specialty")}:{" "}
        </ExtraSmall>
        <ExtraSmall className="">
          {assistantInfo?.speciality ||
            t("student.assistantProfile.generalAssistant")}
        </ExtraSmall>
      </div>

      {/* Topics */}
      <div className="space-y-2">
        <ExtraSmall className="font-semibold text-foreground">
          {t("student.assistantProfile.topics")}:{" "}
        </ExtraSmall>

        {isLoading ? (
          <LoadingState
            message={t("student.assistantProfile.loadingTopics")}
            size="small"
          />
        ) : hasError ? (
          <ExtraSmall className="text-destructive">
            {t("student.assistantProfile.failedToLoadData")}
          </ExtraSmall>
        ) : conversationData ? (
          <div className="space-y-2">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="w-full">
                    {t("student.assistantProfile.category")}
                  </TableHead>
                  <TableHead className="w-16 text-right">
                    {t("student.assistantProfile.count")}
                  </TableHead>
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
                        <TableCell className="w-8">
                          {expandedCategories[category] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="w-full">
                          <ExtraSmall className="font-medium">
                            {getCategoryTitle(category)}
                          </ExtraSmall>
                        </TableCell>
                        <TableCell className="w-16 text-right">
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
                            <TableCell className="w-8"></TableCell>
                            <TableCell className="w-full">
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
                            <TableCell className="w-16 text-right"></TableCell>
                          </TableRow>
                        ))}
                    </>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <ExtraSmall className="text-muted-foreground">
            No topics available
          </ExtraSmall>
        )}
      </div>
    </div>
  );
}
