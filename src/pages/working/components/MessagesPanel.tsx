import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, Plus, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useStudent } from "@/contexts/StudentContext";
import { useAuth } from "@/contexts/AuthContext";
import { createConversation, listConversations } from "@/api/conversations";
// Backend DTOs are used directly; no local mapping types required here
import type {
  ConversationListItem,
  ConversationParticipantBrief,
} from "@/lib/utils/types/conversation";
// import { formatDistanceToNow } from "date-fns";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { listMembers, type WorkspaceMember } from "@/api/workspaces";

// Short relative time formatter: 33m, 1h, 2d, etc.
function formatShortRelativeTime(input?: string | Date | null): string {
  if (!input) return "";
  const target = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const diffMs = now.getTime() - target.getTime();
  const sec = Math.max(1, Math.floor(diffMs / 1000));
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (sec < 60) return "1m"; // treat <1m as 1m
  if (min < 60) return `${min}m`;
  if (hr < 24) return `${hr}h`;
  return `${day}d`;
}

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
  currentUserId?: string | null;
}

// Backend now provides precomputed display info; no FE computation needed
type ConversationDisplay = {
  name?: string | null;
  avatars_to_show?: ConversationParticipantBrief[];
  single_avatar_name?: string | null;
  avatars?: ConversationParticipantBrief[]; // backward-compat
};

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  const display = (conversation as any).display as
    | ConversationDisplay
    | undefined;
  const avatarsToShow = display?.avatars_to_show || display?.avatars || [];
  const singleAvatarName =
    display?.single_avatar_name ||
    display?.name ||
    conversation.conversation_name ||
    null;
  return (
    <div
      className={cn(
        "flex items-stretch gap-2 rounded-lg cursor-pointer transition-colors p-2 ",
        "hover:bg-accent/50",
        isSelected && "bg-accent border border-border"
      )}
      onClick={onClick}
    >
      <div className="">
        {avatarsToShow.length === 1 ? (
          <UserAvatar
            name={singleAvatarName || avatarsToShow[0]?.name || "Chat"}
            avatarUrl={avatarsToShow[0]?.image || undefined}
            className="aspect-square rounded-md h-11 w-11"
          />
        ) : avatarsToShow.length > 1 ? (
          <div className="h-11 w-11 grid grid-cols-2 grid-rows-2 gap-0.5">
            {avatarsToShow.map((p, idx) => (
              <Avatar
                key={p.id + String(idx)}
                className="h-full w-full rounded-sm"
              >
                <AvatarImage src={p.image || undefined} />
                <AvatarFallback className="text-[10px]">
                  {(p.name || "?")
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        ) : (
          <div className="h-10 w-10 aspect-square rounded-md bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-foreground truncate">
            {singleAvatarName ||
              conversation.conversation_name ||
              "Untitled Conversation"}
          </h3>
          <span className="shrink-0 text-[11px] text-muted-foreground ml-2">
            {formatShortRelativeTime(conversation.last_message?.time)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="flex-1 text-sm text-muted-foreground truncate">
            {(conversation as any)?.last_message?.content || "No messages yet"}
          </p>
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
  onToggleCollapse: _onToggleCollapse, // kept for API compatibility
}) => {
  const { t } = useTranslation();
  const { workspaceId, setConversationId, assistantId } = useStudent();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  // New group dialog state
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [membersLoading, setMembersLoading] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>(
    []
  );
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );
  const [creatingGroup, setCreatingGroup] = useState(false);

  // removed old dm target helper in favor of computeAvatarDisplay

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
          // Use backend DTO directly; FE will rely on c.display and c.last_message
          setConversations(
            response.conversations as unknown as ConversationListItem[]
          );
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        // Fallback mock data
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

  const loadMembers = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setMembersLoading(true);
      const res = await listMembers(workspaceId);
      setWorkspaceMembers(res.items || []);
      // Preselect current user for convenience
      if (user?.id) setSelectedUserIds(new Set([user.id]));
    } catch (e) {
      // swallow error, UI will show empty list
      setWorkspaceMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [workspaceId, user?.id]);

  const handleNewConversation = () => {
    setGroupName("");
    setSelectedUserIds(new Set(user?.id ? [user.id] : []));
    setIsGroupDialogOpen(true);
    void loadMembers();
  };

  const toggleMember = (id: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const refreshConversations = useCallback(async () => {
    if (!workspaceId) return;
    const response = await listConversations({
      workspace_id: workspaceId,
      page_number: 1,
      page_size: 100,
    });
    if (response && Array.isArray(response.conversations)) {
      // Use backend DTO directly; no mapping
      setConversations(
        response.conversations as unknown as ConversationListItem[]
      );
    }
  }, [workspaceId]);

  const handleCreateGroup = async () => {
    if (!workspaceId || !user?.id) return;
    const participant_user_ids = Array.from(selectedUserIds);
    if (participant_user_ids.length === 0) return;
    try {
      setCreatingGroup(true);
      const resp = await createConversation({
        workspace_id: workspaceId,
        type: "group",
        title: groupName || "New group",
        created_by_user: user.id,
        participant_user_ids,
        participant_assistant_ids: assistantId ? [assistantId] : [],
      });
      await refreshConversations();
      if (resp?.id) {
        handleConversationClick(resp.id);
      }
      setIsGroupDialogOpen(false);
    } catch (e) {
      // TODO: surface toast
      // console.error(e);
    } finally {
      setCreatingGroup(false);
    }
  };

  console.log(conversations);

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
            {conversations.slice(0, 8).map((conversation) => {
              const display = (conversation as any).display as
                | ConversationDisplay
                | undefined;
              const avatarsToShow =
                display?.avatars_to_show || display?.avatars || [];
              const singleAvatarName =
                display?.single_avatar_name ||
                display?.name ||
                conversation.conversation_name ||
                null;
              return (
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
                    singleAvatarName ||
                    conversation.conversation_name ||
                    "Untitled Conversation"
                  }
                >
                  {avatarsToShow.length > 0 ? (
                    avatarsToShow.length === 1 ? (
                      <UserAvatar
                        name={
                          singleAvatarName || avatarsToShow[0]?.name || "Chat"
                        }
                        avatarUrl={avatarsToShow[0]?.image || undefined}
                        className="w-8 h-8"
                      />
                    ) : (
                      <div className="w-8 h-8 grid grid-cols-2 grid-rows-2 gap-0.5">
                        {avatarsToShow.slice(0, 4).map((p, idx) => (
                          <Avatar
                            key={p.id + String(idx)}
                            className="h-full w-full rounded-sm"
                          >
                            <AvatarImage src={p.image || undefined} />
                            <AvatarFallback className="text-[9px]">
                              {(p.name || "?")
                                .split(" ")
                                .slice(0, 2)
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              );
            })}
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
          <div className="space-y-1">
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
      {/* Create Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create group</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <Input
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto rounded-md border border-border p-2">
              {membersLoading ? (
                <div className="text-sm text-muted-foreground p-2">
                  Loading members...
                </div>
              ) : workspaceMembers.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2">
                  No members
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {workspaceMembers.map((m) => {
                    const checked = selectedUserIds.has(m.user_id);
                    return (
                      <button
                        type="button"
                        key={m.user_id}
                        onClick={() => toggleMember(m.user_id)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-md p-2 text-left hover:bg-accent/50",
                          checked && "bg-accent/30"
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleMember(m.user_id)}
                        />
                        <UserAvatar
                          name={m.full_name || m.email}
                          avatarUrl={m.avatar_url || undefined}
                          className="h-7 w-7 rounded-md"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {m.full_name || m.email}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {m.email}
                          </div>
                        </div>
                        <div className="ml-auto text-xs text-muted-foreground capitalize">
                          {m.role}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGroupDialogOpen(false)}
              disabled={creatingGroup}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={creatingGroup || selectedUserIds.size === 0}
            >
              {creatingGroup ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
