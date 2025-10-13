import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Plus,
  MessageSquare,
  Clock,
  Star,
  ChevronLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useStudent } from "@/contexts/StudentContext";
import { listConversations } from "@/api/conversations";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import { formatDistanceToNow } from "date-fns";

interface MessagesPanelProps {
  className?: string;
  onConversationSelect?: (conversationId: string) => void;
  selectedConversationId?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface ConversationItemProps {
  conversation: ConversationListItem;
  isSelected: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        "hover:bg-accent/50",
        isSelected && "bg-accent border border-border"
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-foreground truncate">
            {conversation.conversation_name || "Untitled Conversation"}
          </h3>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-muted-foreground" />
            <Clock className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {conversation.conversation_description || "No description"}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {conversation.assistants && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                Assistant
              </Badge>
            )}
            {conversation.participants &&
              conversation.participants.length > 0 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {conversation.participants.length} participant
                  {conversation.participants.length > 1 ? "s" : ""}
                </Badge>
              )}
          </div>

          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

export const MessagesPanel: React.FC<MessagesPanelProps> = ({
  className,
  onConversationSelect,
  selectedConversationId,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { t } = useTranslation();
  const { workspaceId, setConversationId } = useStudent();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!workspaceId) return;

      try {
        setIsLoading(true);
        const response = await listConversations({
          workspace_id: workspaceId,
          page_number: 1,
          page_size: 100,
        });

        if (response && Array.isArray(response.conversations)) {
          setConversations(
            response.conversations.map(
              (c: any): ConversationListItem => ({
                id: c.id ?? null,
                assistants: c.assistants ?? null,
                participants: c.participants ?? [],
                conversation_name: c.title ?? null,
                conversation_description: c.conversation_description ?? "",
              })
            )
          );
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        // Fallback mock data
        setConversations([
          {
            id: "mock-1",
            assistants: {
              id: "assistant-1",
              name: "AI Assistant",
              image: "",
              tagline: "Your AI helper",
            },
            participants: [
              {
                id: "user-1",
                kind: "user" as const,
                name: "John Doe",
              },
            ],
            conversation_name: "Design sync with team",
            conversation_description: "Catch up and next steps",
          },
          {
            id: "mock-2",
            assistants: {
              id: "assistant-2",
              name: "Code Helper",
              image: "",
              tagline: "Code assistance",
            },
            participants: [
              {
                id: "user-2",
                kind: "user" as const,
                name: "Jane Smith",
              },
            ],
            conversation_name: "Onboarding questions",
            conversation_description: "HR and access setup",
          },
          {
            id: "mock-3",
            assistants: {
              id: "assistant-3",
              name: "Project Manager",
              image: "",
              tagline: "Project guidance",
            },
            participants: [
              {
                id: "user-3",
                kind: "user" as const,
                name: "Bob Wilson",
              },
            ],
            conversation_name: "Sprint planning",
            conversation_description: "Backlog and priorities",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, [workspaceId]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      conversation.conversation_name?.toLowerCase().includes(query) ||
      conversation.conversation_description?.toLowerCase().includes(query)
    );
  });

  const handleConversationClick = (conversationId: string) => {
    setConversationId(conversationId);
    onConversationSelect?.(conversationId);
  };

  const handleNewConversation = () => {
    // Create new conversation logic here
    console.log("Creating new conversation");
  };

  const handleToggleCollapse = () => {
    onToggleCollapse?.();
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div
        className={cn(
          "flex items-center border-b border-border",
          isCollapsed ? "justify-center p-2 h-20" : "justify-between p-4 h-20"
        )}
      >
        {isCollapsed ? (
          <div className="flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Messages
              </h2>
              <Badge variant="secondary" className="text-xs">
                {conversations.length}
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="sm"
                onClick={handleNewConversation}
                className="h-8 w-8 p-0"
                aria-label="New conversation"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Search */}
      {!isCollapsed && (
        <>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("student.messages.searchPlaceholder", {
                  defaultValue: "Search conversations...",
                })}
                className="pl-9 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      {/* Conversations List */}
      <div className={cn("flex-1 overflow-y-auto", !isCollapsed && "p-4")}>
        {isCollapsed ? (
          <div className="flex flex-col gap-1 p-2">
            {conversations.slice(0, 8).map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "flex items-center justify-center p-2 rounded-md cursor-pointer transition-colors",
                  "hover:bg-accent/50",
                  conversation.id === selectedConversationId &&
                    "bg-accent border border-border"
                )}
                onClick={() =>
                  conversation.id && handleConversationClick(conversation.id)
                }
                title={
                  conversation.conversation_name || "Untitled Conversation"
                }
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
              </div>
            ))}
            {conversations.length > 8 && (
              <div className="flex items-center justify-center p-2">
                <span className="text-xs text-muted-foreground">
                  +{conversations.length - 8} more
                </span>
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-muted-foreground">
              Loading conversations...
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </p>
            {!searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewConversation}
                className="mt-2"
              >
                Start a conversation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                onClick={() =>
                  conversation.id && handleConversationClick(conversation.id)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
