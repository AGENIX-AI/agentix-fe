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
  sender: "student" | "instructor" | "agent" | "user";
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
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Keep latest participants in a ref to avoid stale closures inside event handler
  const headerParticipantsRef = useRef<ParticipantBriefDTO[]>([]);

  // Load messages history from API (first page)
  useEffect(() => {
    let isCancelled = false;
    async function load() {
      if (!conversationId) return;
      try {
        setIsLoading(true);
        const res = await apiListMessages(conversationId, 1, pageSize);
        if (isCancelled) return;
        // Use header from backend as-is
        const header = (res as any)?.conversation?.header || {};
        const participants = (header.participants_brief ||
          []) as ParticipantBriefDTO[];
        console.log("participants", participants);
        setHeaderParticipants(participants);
        setHeaderTitle(header.title ?? null);

        let mapped: Message[] = (res.messages || []).map(
          (m: MessageResponseDTO) => ({
            id: m.id,
            sender:
              ((m as any).sender_role as "agent" | "student") ||
              (m.sender_assistant_id ? "agent" : "student"),
            content: m.content,
            timestamp: (m as any).timestamp
              ? new Date((m as any).timestamp)
              : new Date(),
            name: (m as any).sender_name ?? (m as any)?.sender?.name,
            avatar: (m as any).sender_image ?? (m as any)?.sender?.image,
            sender_user_id: (m as any).sender_user_id ?? null,
            sender_assistant_id: (m as any).sender_assistant_id ?? null,
            reply_to_message_id: (m as any).reply_to_message_id || null,
            reply_to_brief: (m as any).reply_to_brief || null,
          })
        );
        // Seed id set to avoid future duplicates from realtime
        messageIdSetRef.current = new Set(mapped.map((m) => m.id));
        // Backend returns DESC; display newest at bottom (ASC)
        mapped = mapped.reverse();
        setMessages(mapped);
        setPageNumber(1);
        setTotalCount((res as any)?.total_count ?? mapped.length);
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
  }, [conversationId, assistantInfo, pageSize]);

  // Participant lookup maps for realtime fallback when sender brief missing

  // Sync participants to ref for realtime handler
  useEffect(() => {
    headerParticipantsRef.current = headerParticipants;
  }, [headerParticipants]);

  // Compute header avatars with same rules as MessagesPanel
  // Header display now fully provided by backend header

  const { headerAvatars, singleHeaderName } = React.useMemo(() => {
    // Backend already computed; use participants only for minimal fallback
    const participants = headerParticipants || [];
    const single = headerTitle || null;
    let avatars: ParticipantBriefDTO[] = [];
    if (participants.length) {
      const assistant =
        participants.find((p) => p.kind === "assistant") || null;
      avatars = assistant
        ? [assistant]
        : ([participants[0]].filter(Boolean) as ParticipantBriefDTO[]);
    }
    return { headerAvatars: avatars, singleHeaderName: single };
  }, [headerParticipants, headerTitle]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  // Infinite scroll: load more when near top (older messages)
  const hasMore = messages.length < totalCount;

  const loadMore = useCallback(async () => {
    if (!conversationId) return;
    if (isLoadingMore) return;
    if (!hasMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = pageNumber + 1;
      // Preserve scroll position before prepend
      const container = scrollContainerRef.current;
      const prevScrollHeight = container ? container.scrollHeight : 0;

      const res = await apiListMessages(conversationId, nextPage, pageSize);
      let mapped: Message[] = (res.messages || []).map(
        (m: MessageResponseDTO) => ({
          id: (m as any).id,
          sender:
            ((m as any).sender_role as "agent" | "student") ||
            ((m as any).sender_assistant_id ? "agent" : "student"),
          content: (m as any).content,
          timestamp: (m as any).timestamp
            ? new Date((m as any).timestamp)
            : new Date(),
          name: (m as any).sender_name ?? (m as any)?.sender?.name,
          avatar: (m as any).sender_image ?? (m as any)?.sender?.image,
          sender_user_id: (m as any).sender_user_id ?? null,
          sender_assistant_id: (m as any).sender_assistant_id ?? null,
          reply_to_message_id: (m as any).reply_to_message_id || null,
          reply_to_brief: (m as any).reply_to_brief || null,
        })
      );
      // Backend returns older page in DESC; convert to ASC for display
      mapped = mapped.reverse();
      const unique = mapped.filter((m) => !messageIdSetRef.current.has(m.id));
      unique.forEach((m) => messageIdSetRef.current.add(m.id));
      // Prepend older messages at the top of current list
      setMessages((prev) => {
        const combined = [...unique, ...prev];
        return combined;
      });
      setPageNumber(nextPage);
      setTotalCount((res as any)?.total_count ?? totalCount);

      // Restore scroll offset so content doesn't jump
      requestAnimationFrame(() => {
        const newScrollHeight = container ? container.scrollHeight : 0;
        if (container)
          container.scrollTop =
            newScrollHeight - prevScrollHeight + (container.scrollTop || 0);
      });
    } catch (e) {
      // ignore
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    conversationId,
    pageNumber,
    pageSize,
    hasMore,
    isLoadingMore,
    totalCount,
  ]);

  const onScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    // If near top (e.g., < 100px), load more older messages
    if (el.scrollTop < 100) {
      void loadMore();
    }
  }, [loadMore]);

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
        console.log("payload::", payload);
        if (!payload || !payload.message) return;
        const m = payload.message;
        if (m.conversation_id && m.conversation_id !== conversationId) return;
        if (m.sender_user_id && m.sender_user_id === user?.id) return; // skip own echo

        const senderRole: "agent" | "user" =
          (m as any).sender_role || (m.sender_assistant_id ? "agent" : "user");
        const tsRaw =
          (m as any).created_at_iso || (m as any).timestamp || m.created_at;
        const timestamp = tsRaw ? new Date(tsRaw) : new Date();
        const parts = headerParticipantsRef.current || [];
        const brief = parts.find(
          (p) => p.id === m.sender_user_id || p.id === m.sender_assistant_id
        );
        const name =
          brief?.name ||
          (m as any).sender_name ||
          (m as any).sender?.name ||
          "";
        const avatar =
          brief?.image ||
          (m as any).sender_image ||
          (m as any).sender?.image ||
          "";

        const mapped: Message = {
          id: m.id,
          sender: senderRole,
          content: m.content ?? "",
          timestamp,
          name,
          avatar,
          sender_user_id: m.sender_user_id ?? null,
          sender_assistant_id: m.sender_assistant_id ?? null,
          reply_to_message_id: (m as any).reply_to_message_id ?? null,
          reply_to_brief: (m as any).reply_to_brief ?? null,
        };
        console.log("mapped", mapped);
        if (mapped.id && !messageIdSetRef.current.has(mapped.id)) {
          messageIdSetRef.current.add(mapped.id);
          setMessages((prev) => [...prev, mapped]);
        }
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
      // Use sender brief from backend directly
      const mapped: Message = {
        id: sent.id,
        sender: sent.sender_assistant_id ? "agent" : "student",
        content: sent.content,
        timestamp: (sent as any).created_at_iso
          ? new Date((sent as any).created_at_iso as string)
          : (sent as any).created_at
          ? new Date((sent as any).created_at as string)
          : new Date(),
        name: (sent as any)?.sender?.name,
        avatar: (sent as any)?.sender?.image,
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
        <div className="flex items-center justify-center p-4 border-b border-border h-20">
          <Avatar className="w-11 h-11 rounded-md">
            <AvatarImage src={assistantInfo?.image} />
            <AvatarFallback>
              {assistantInfo?.name?.charAt(0) || "AI"}
            </AvatarFallback>
          </Avatar>
        </div>
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
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        ref={scrollContainerRef}
        onScroll={onScroll}
      >
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
