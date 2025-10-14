import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useStudent } from "@/contexts/StudentContext";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  listMessages as apiListMessages,
  sendMessage as apiSendMessage,
  getConversationById,
} from "@/api/conversations";
import type { MessageResponseDTO } from "@/api/conversations";
import type { ParticipantBriefDTO } from "@/api/conversations";
import { eventBus } from "@/lib/utils/event/eventBus";

interface ChatPanelProps {
  className?: string;
  conversationId?: string;
  isMessagesCollapsed?: boolean;
}

interface Message {
  id: string;
  sender: "student" | "instructor" | "agent";
  content: string;
  timestamp: Date;
  avatar?: string;
  name?: string;
  sender_user_id?: string | null;
  sender_assistant_id?: string | null;
  reply_to_message_id?: string | null;
  reply_to_brief?: {
    id: string;
    content?: string;
    sender_user_id?: string | null;
    sender_assistant_id?: string | null;
  } | null;
}

const MessageBubble: React.FC<{
  message: Message;
  isOwn: boolean;
  onReply?: (payload: { id: string; preview: string }) => void;
}> = ({ message, isOwn, onReply }) => {
  return (
    <div className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
      <Avatar className="w-11 h-11 rounded-md flex-shrink-0">
        <AvatarImage src={message.avatar} />
        <AvatarFallback className="text-xs">
          {message.name?.charAt(0) || message.sender.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col max-w-[70%]", isOwn && "items-end")}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-foreground">
            {message.name || message.sender}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(message.timestamp, "h:mm a")}
          </span>
        </div>

        {/* Bubble + actions on the same row */}
        <div
          className={cn(
            "flex items-center gap-1",
            isOwn && "flex-row-reverse w-full"
          )}
        >
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              isOwn
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {message.reply_to_brief && (
              <div className="mb-2 pl-2 border-l-2 border-border/60">
                <div className="text-[11px] truncate">
                  {message.reply_to_brief.content || "Replied message"}
                </div>
              </div>
            )}
            {message.content}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 p-0"
                aria-label="Message actions"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isOwn ? "start" : "end"}
              side={isOwn ? "left" : "right"}
            >
              <DropdownMenuItem
                onClick={() =>
                  onReply?.({ id: message.id, preview: message.content })
                }
              >
                Reply
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

// removed typing indicator while migrating to realtime events

export const ChatPanel: React.FC<ChatPanelProps> = ({
  className,
  conversationId,
  isMessagesCollapsed = false,
}) => {
  const { assistantInfo } = useStudent();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const messageIdSetRef = useRef<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: string;
    preview: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [headerParticipants, setHeaderParticipants] = useState<
    ParticipantBriefDTO[]
  >([]);
  const [headerTitle, setHeaderTitle] = useState<string | null>(null);
  // typing indicator omitted for now
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load messages history from API
  useEffect(() => {
    let isCancelled = false;
    async function load() {
      if (!conversationId) return;
      try {
        setIsLoading(true);
        const res = await apiListMessages(conversationId, 1, 50);
        if (isCancelled) return;
        // Build participant lookup maps if provided by API
        const participants: Array<{
          id: string;
          kind: "user" | "assistant";
          name?: string | null;
          image?: string | null;
        }> = (res as any).participants || [];
        setHeaderParticipants(participants as ParticipantBriefDTO[]);
        // Fetch conversation metadata for title
        try {
          const conv = await getConversationById(conversationId);
          setHeaderTitle((conv as any)?.title ?? null);
        } catch {
          // ignore title errors
        }
        const userMap = new Map<
          string,
          { name?: string | null; image?: string | null }
        >();
        const assistantMap = new Map<
          string,
          { name?: string | null; image?: string | null }
        >();
        for (const p of participants) {
          if (p.kind === "user")
            userMap.set(p.id, { name: p.name, image: p.image });
          else if (p.kind === "assistant")
            assistantMap.set(p.id, { name: p.name, image: p.image });
        }

        const mapped: Message[] = (res.messages || []).map(
          (m: MessageResponseDTO) => {
            const isAgent = Boolean(m.sender_assistant_id);
            const senderAssistant = m.sender_assistant_id
              ? assistantMap.get(m.sender_assistant_id)
              : undefined;
            const senderUser = m.sender_user_id
              ? userMap.get(m.sender_user_id)
              : undefined;

            return {
              id: m.id,
              sender: isAgent ? "agent" : "student",
              content: m.content,
              timestamp:
                m && (m as any).created_at
                  ? new Date((m as any).created_at as string)
                  : new Date(),
              name: isAgent
                ? senderAssistant?.name || "Assistant"
                : senderUser?.name || "Member",
              avatar: isAgent ? senderAssistant?.image : senderUser?.image,
              sender_user_id: m.sender_user_id ?? null,
              sender_assistant_id: m.sender_assistant_id ?? null,
              reply_to_message_id: (m as any).reply_to_message_id || null,
              reply_to_brief: (m as any).reply_to_brief || null,
            } as Message;
          }
        );
        // Seed id set to avoid future duplicates from realtime
        messageIdSetRef.current = new Set(mapped.map((m) => m.id));
        setMessages(mapped);
      } catch (e) {
        // Silently ignore for now; could surface a toast
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [conversationId, assistantInfo]);

  // Participant lookup maps for realtime usage as well
  const participantUserMap = React.useMemo(() => {
    const map = new Map<
      string,
      { name?: string | null; image?: string | null }
    >();
    for (const p of headerParticipants) {
      if (p.kind === "user") map.set(p.id, { name: p.name, image: p.image });
    }
    return map;
  }, [headerParticipants]);

  const participantAssistantMap = React.useMemo(() => {
    const map = new Map<
      string,
      { name?: string | null; image?: string | null }
    >();
    for (const p of headerParticipants) {
      if (p.kind === "assistant")
        map.set(p.id, { name: p.name, image: p.image });
    }
    return map;
  }, [headerParticipants]);

  // Compute header avatars with same rules as MessagesPanel
  function computeHeaderDisplay(
    participants: ParticipantBriefDTO[] | undefined,
    currentUserId?: string | null
  ): { headerAvatars: ParticipantBriefDTO[]; singleHeaderName: string | null } {
    const list = participants || [];
    const assistant = list.find((p) => p.kind === "assistant") || null;
    const users = list.filter((p) => p.kind === "user");
    const others = users.filter((u) => u.id !== currentUserId);
    const length = list.length;
    if (length === 2) {
      return {
        headerAvatars: assistant ? [assistant] : others.slice(0, 1),
        singleHeaderName:
          (assistant?.name || others[0]?.name) ?? "Conversation",
      };
    }
    if (length === 3) {
      const target = others[0] || null;
      return {
        headerAvatars: target ? [target] : assistant ? [assistant] : [],
        singleHeaderName: (target?.name || assistant?.name) ?? "Conversation",
      };
    }
    if (length > 3) {
      const filtered = list.filter(
        (p) => p.kind === "user" && p.id !== currentUserId
      );
      return { headerAvatars: filtered.slice(0, 4), singleHeaderName: null };
    }
    return {
      headerAvatars: assistant ? [assistant] : list.slice(0, 1),
      singleHeaderName: (assistant?.name || list[0]?.name) ?? "Conversation",
    };
  }

  const { headerAvatars, singleHeaderName } = React.useMemo(
    () => computeHeaderDisplay(headerParticipants, user?.id ?? null),
    [headerParticipants, user?.id]
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Listen to global realtime events and append to this chat if conversation matches
  useEffect(() => {
    if (!conversationId) return;
    const off = eventBus.on("websocket-message", (payload: any) => {
      try {
        if (!payload || payload.conversation_id !== conversationId) return;
        const isAgent =
          (payload.sender as string) === "agent" ||
          !!payload.sender_assistant_id ||
          !!payload.message?.sender_assistant_id;
        const id: string =
          (payload.message && payload.message.id) ||
          (typeof crypto !== "undefined" && (crypto as any).randomUUID
            ? (crypto as any).randomUUID()
            : String(Date.now()));
        if (id && messageIdSetRef.current.has(id)) return; // de-duplicate
        const timestamp = payload.timestamp
          ? new Date(payload.timestamp)
          : new Date();
        // Resolve sender profile
        const senderAssistantId: string | undefined =
          payload.sender_assistant_id || payload.message?.sender_assistant_id;
        const senderUserId: string | undefined =
          payload.user_id || payload.message?.sender_user_id;

        let resolvedName: string | undefined;
        let resolvedAvatar: string | undefined;
        if (isAgent) {
          const prof = senderAssistantId
            ? participantAssistantMap.get(senderAssistantId)
            : undefined;
          const anyAssistant = headerParticipants.find(
            (p) => p.kind === "assistant"
          );
          resolvedName = prof?.name || anyAssistant?.name || "Assistant";
          resolvedAvatar = prof?.image || anyAssistant?.image || undefined;
        } else {
          if (senderUserId) {
            const prof = participantUserMap.get(senderUserId);
            resolvedName = prof?.name || "Member";
            resolvedAvatar = prof?.image || undefined;
          } else {
            resolvedName = "Member";
            resolvedAvatar = undefined;
          }
        }

        const mapped: Message = {
          id,
          sender: isAgent ? "agent" : "student",
          content:
            payload.content ?? payload.text ?? payload.message?.content ?? "",
          timestamp,
          name: resolvedName,
          avatar: resolvedAvatar,
          sender_user_id: senderUserId ?? null,
          sender_assistant_id: senderAssistantId ?? null,
          reply_to_message_id: payload.message?.reply_to_message_id ?? null,
          reply_to_brief: payload.message?.reply_to_brief ?? null,
        };
        if (mapped.id) messageIdSetRef.current.add(mapped.id);
        setMessages((prev) => [...prev, mapped]);
      } catch (e) {
        // swallow to avoid UI break
      }
    });
    return () => off();
  }, [conversationId, assistantInfo, user?.id]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !conversationId) return;
    const content = inputValue.trim();
    setInputValue("");
    try {
      const sent = await apiSendMessage(conversationId, content, {
        reply_to_message_id: replyTo?.id,
      });
      // Resolve from participants only (no hard-coded fallbacks)
      let nameResolved: string | undefined;
      let avatarResolved: string | undefined;
      if (sent.sender_assistant_id) {
        const prof = participantAssistantMap.get(sent.sender_assistant_id);
        nameResolved = prof?.name || "Assistant";
        avatarResolved = prof?.image || undefined;
      } else if (sent.sender_user_id) {
        const prof = participantUserMap.get(sent.sender_user_id);
        nameResolved = prof?.name || "Member";
        avatarResolved = prof?.image || undefined;
      }
      const mapped: Message = {
        id: sent.id,
        sender: sent.sender_assistant_id ? "agent" : "student",
        content: sent.content,
        timestamp: (sent as any).created_at
          ? new Date((sent as any).created_at as string)
          : new Date(),
        name: nameResolved,
        avatar: avatarResolved,
        sender_user_id: (sent as any).sender_user_id ?? null,
        sender_assistant_id: (sent as any).sender_assistant_id ?? null,
        reply_to_message_id: (sent as any).reply_to_message_id || null,
        reply_to_brief: (sent as any).reply_to_brief || null,
      };
      if (mapped.id) messageIdSetRef.current.add(mapped.id);
      setMessages((prev) => [...prev, mapped]);
      setReplyTo(null);
    } catch (e) {
      // On failure, optionally restore input or show error
    }
  }, [inputValue, conversationId, assistantInfo, replyTo]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleFileUpload = useCallback(() => {
    // File upload logic here
    console.log("File upload clicked");
  }, []);

  if (!conversationId) {
    return (
      <div className={cn("flex flex-col h-full bg-background", className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Send className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Select a conversation
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose a conversation from the messages panel to start chatting
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border h-20">
        {isMessagesCollapsed ? (
          // Collapsed header - only show icon
          <div className="flex items-center justify-center w-full">
            <Avatar className="w-11 h-11 rounded-md">
              <AvatarImage src={assistantInfo?.image} />
              <AvatarFallback>
                {assistantInfo?.name?.charAt(0) || "AI"}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          // Full header (mirror MessagesPanel: Users + Assistant + Group Name)
          <div className="flex items-center gap-3">
            {headerAvatars.length === 1 ? (
              <Avatar className="w-11 h-11 rounded-md">
                <AvatarImage
                  src={headerAvatars[0]?.image || assistantInfo?.image}
                />
                <AvatarFallback>
                  {(
                    singleHeaderName ||
                    headerAvatars[0]?.name ||
                    assistantInfo?.name ||
                    "AI"
                  )?.charAt(0) || "AI"}
                </AvatarFallback>
              </Avatar>
            ) : headerAvatars.length > 1 ? (
              <div className="h-11 w-11 grid grid-cols-2 grid-rows-2 gap-0.5">
                {headerAvatars.map((p, idx) => (
                  <Avatar
                    key={p.id + String(idx)}
                    className="h-11 w-11 rounded-md"
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
              <Avatar className="w-11 h-11 rounded-md">
                <AvatarImage src={assistantInfo?.image} />
                <AvatarFallback>
                  {(assistantInfo?.name || "AI")?.charAt(0) || "AI"}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h3 className="font-semibold text-foreground">
                {headerTitle ||
                  singleHeaderName ||
                  assistantInfo?.name ||
                  "Conversation"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {assistantInfo?.tagline || "Always here to help"}
              </p>
            </div>
          </div>
        )}

        {!isMessagesCollapsed && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn("flex gap-3", i % 2 === 1 && "flex-row-reverse")}
              >
                <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                <div
                  className={cn(
                    "flex flex-col max-w-[70%]",
                    i % 2 === 1 && "items-end"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-3 w-16 bg-muted rounded" />
                    <div className="h-3 w-10 bg-muted rounded" />
                  </div>
                  <div
                    className={cn(
                      "rounded-lg px-3 py-3 bg-muted",
                      i % 2 === 1 ? "" : ""
                    )}
                  >
                    <div className="h-3 w-40 bg-muted-foreground/20 rounded mb-2" />
                    <div className="h-3 w-28 bg-muted-foreground/20 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_user_id === (user?.id ?? null)}
                onReply={(p) => setReplyTo(p)}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <Separator />

      {/* Input Area */}
      <div className="p-4">
        {replyTo && (
          <div className="mb-2 px-3 py-2 rounded-md bg-accent/30 border border-border text-xs flex items-center justify-between">
            <div className="truncate mr-2">
              Replying to:{" "}
              <span className="text-muted-foreground">{replyTo.preview}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => setReplyTo(null)}
            >
              Cancel
            </Button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFileUpload}
            className="h-9 w-9 p-0 flex-shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[40px] max-h-[120px] resize-none pr-10"
              rows={1}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            size="sm"
            className="h-9 w-9 p-0 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
