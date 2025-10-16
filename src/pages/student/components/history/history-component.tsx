import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useStudent } from "@/contexts/StudentContext";
import { UserConversationsBlock } from "./UserConversationsBlock";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import { BaseHistoryComponent } from "@/components/reused/history";
import { listConversations } from "@/api/conversations";
import { Input } from "@/components/ui/input";
import { Play, Search } from "lucide-react";

interface HistoryComponentProps {
  className?: string;
  isHistoryVisible?: boolean;
  toggleHistory?: () => void;
}

export function HistoryComponent({
  className,
  isHistoryVisible: propIsHistoryVisible,
  toggleHistory: propToggleHistory,
}: HistoryComponentProps) {
  const { t } = useTranslation();
  const { setIsChatLoading, workspaceId } = useStudent();
  const [searchQuery, setSearchQuery] = useState("");

  // Use props if provided, otherwise fall back to context
  const isHistoryVisible = propIsHistoryVisible;
  const toggleHistory = propToggleHistory;

  const [conversations, setConversations] = useState<ConversationListItem[]>(
    []
  );
  const [dataFetched, setDataFetched] = useState(false);

  // Fetch data once when component mounts - NOT on every visibility change
  useEffect(() => {
    const fetchData = async () => {
      if (dataFetched) return;
      try {
        const json = await listConversations({
          workspace_id: workspaceId || "",
          page_number: 1,
          page_size: 100,
        });
        if (json && Array.isArray(json.conversations)) {
          setConversations(
            json.conversations.map(
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
        // Fallback: if no data, provide mock data to match design
        if (
          !json ||
          !Array.isArray(json.conversations) ||
          json.conversations.length === 0
        ) {
          setConversations([
            {
              id: "mock-1",
              assistants: null,
              participants: [],
              conversation_name: "Design sync with team",
              conversation_description: "Catch up and next steps",
            },
            {
              id: "mock-2",
              assistants: null,
              participants: [],
              conversation_name: "Onboarding questions",
              conversation_description: "HR and access setup",
            },
            {
              id: "mock-3",
              assistants: null,
              participants: [],
              conversation_name: "Sprint planning",
              conversation_description: "Backlog and priorities",
            },
            {
              id: "mock-4",
              assistants: null,
              participants: [],
              conversation_name: "Bug triage thread",
              conversation_description: "Investigate recent errors",
            },
            {
              id: "mock-5",
              assistants: null,
              participants: [],
              conversation_name: "Knowledge base update",
              conversation_description: "Docs to revise",
            },
          ]);
        }
        setDataFetched(true);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [dataFetched]);

  const versionInfo = `v.${import.meta.env.VITE_APP_VERSION}.${
    import.meta.env.VITE_APP_LAST_BUILD_DATE
  }`;

  const collapsedContent = <div className="px-0" />;

  const expandedSections = (
    <div className="space-y-4">
      {/* Search */}
      <div className="">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            aria-label="Search messages"
            placeholder={t("student.history.searchPlaceholder", {
              defaultValue: "Search messages",
            })}
            className="pl-9 h-10 text-sm rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat Sessions Section Title */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Play className="h-4 w-4" aria-hidden />
        <span className="text-xs font-medium">
          {t("student.history.chatSessions", { defaultValue: "Chat Sessions" })}
        </span>
      </div>

      {/* Message list */}
      <div className="space-y-2 px-0">
        <UserConversationsBlock
          searchQuery={searchQuery}
          setIsChatLoading={setIsChatLoading}
          conversationsData={conversations}
        />
      </div>

      {/* Task Threads Section Title */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Play className="h-4 w-4" aria-hidden />
        <span className="text-xs font-medium">
          {t("student.history.taskThreads", { defaultValue: "Task Threads" })}
        </span>
      </div>

      {/* Simple mocked task threads to mirror Figma composition */}
      <div className="space-y-2">
        {["Design Review", "Docs Cleanup"].map((title, idx) => (
          <div
            key={`task-${idx}`}
            className="rounded-md border border-border bg-card text-card-foreground shadow-sm px-3 py-3 hover:bg-accent/30 transition-colors cursor-default"
            role="listitem"
            aria-label={`Task thread: ${title}`}
          >
            <div className="text-sm font-medium leading-5 truncate">
              {title}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              Recent updates and comments
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <BaseHistoryComponent
      className={className}
      isHistoryVisible={isHistoryVisible}
      toggleHistory={toggleHistory}
      historyTitle="Messages"
      headerRight={
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center h-6 px-2 rounded-full bg-muted text-foreground text-xs">
            12
          </span>
          <button
            type="button"
            aria-label="New chat"
            className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-border hover:bg-accent/40"
          >
            <span className="sr-only">New chat</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M12 5c.414 0 .75.336.75.75V11.25H18.25a.75.75 0 0 1 0 1.5H12.75V18.25a.75.75 0 0 1-1.5 0V12.75H5.75a.75.75 0 0 1 0-1.5H11.25V5.75c0-.414.336-.75.75-.75Z" />
            </svg>
          </button>
        </div>
      }
      collapsedContent={collapsedContent}
      expandedSections={expandedSections}
      versionInfo={versionInfo}
    />
  );
}
