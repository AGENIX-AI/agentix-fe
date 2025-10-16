import { useTranslation } from "react-i18next";
import { Large } from "@/components/ui/typography";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { PanelRight } from "lucide-react";
import { useStudent } from "@/contexts/StudentContext";
import { Input } from "@/components/ui/input";
import { workspaceService } from "@/services/workspaces";
import type { CreateWorkspaceRequest } from "@/services/workspaces/types";
// removed duplicate Button import
import {
  listMembers,
  inviteUser,
  listInvites,
  acceptInvite,
} from "@/api/workspaces";

import { Calendar as UiCalendar } from "@/components/ui/calendar";

const RightPanelHeader = ({ title }: { title: string }) => {
  return (
    <header className="bg-background flex h-20 border-b p-4 items-center gap-3 w-full">
      <Large className="font-bold">{title}</Large>
    </header>
  );
};

const CollapsedVerticalBar = ({ title }: { title: string }) => {
  return (
    <div className="h-full bg-background flex flex-col duration-200 shadow-sm relative ">
      {/* Expand button at top */}
      <div className="p-2 border-b border-border flex justify-center h-20 items-center">
        <PanelRight className="h-8 w-8" />
      </div>

      {/* Vertical title */}
      <div className="flex-1 flex items-center justify-center py-6">
        <div
          className="transform -rotate-90 whitespace-nowrap origin-center text-sm font-medium text-foreground/70 select-none"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(90deg)",
          }}
        >
          {title}
        </div>
      </div>

      {/* Visual indicators */}
      <div className="flex flex-col items-center gap-1 pb-4">
        <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"></div>
      </div>
    </div>
  );
};

export default function RightPanel({
  onToggle,
  isCollapsed = false,
}: {
  onToggle?: (isCollapsed: boolean) => void;
  isCollapsed?: boolean;
}) {
  const { t } = useTranslation();
  const { rightPanel } = useStudent();

  const getCurrentTitle = () => {
    switch (rightPanel) {
      case "empty":
        return t("student.rightPanel.homePage");
      default:
        return t("student.rightPanel.rightPanel");
    }
  };

  const currentTitle = getCurrentTitle();

  // Show collapsed vertical bar when collapsed
  if (isCollapsed) {
    return <CollapsedVerticalBar title={currentTitle} />;
  }

  // Show expanded panel content
  switch (rightPanel) {
    case "empty":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title={t("student.rightPanel.homePage")} />
          <div className="flex-1 w-full flex items-center justify-center p-6 bg-background border-border">
            <div className="flex items-center justify-center">
              <img
                src="https://api-app.edvara.net/static/Wavy_Tech-12_Single-01.jpg"
                alt="AgentIX"
                className="w-240 h-240 object-contain"
              />
            </div>
          </div>
        </div>
      );
    case "taskPanel":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title={t("Tasks")} />
        </div>
      );
    case "calendar":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title={t("Calendar")} />
          <div className="p-4">
            <UiCalendar
              mode="single"
              className="rounded-lg border border-border"
            />
          </div>
        </div>
      );
    case "createWorkspace":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title={t("Create workspace")} />
          <div className="px-6 py-3">
            <form
              className="space-y-3 max-w-md"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement & {
                  name: { value: string };
                  description: { value: string };
                  image_url: { value: string };
                };
                const payload: CreateWorkspaceRequest = {
                  name: form.name.value,
                  description: form.description.value || undefined,
                  image_url: form.image_url.value || undefined,
                  is_default: true,
                };
                await workspaceService.create(payload);
                // After creating, close panel
                if (onToggle) onToggle(true);
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input name="name" required placeholder="Workspace name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input name="description" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image URL
                </label>
                <Input name="image_url" placeholder="https://..." />
              </div>
              <div className="pt-2">
                <Button type="submit" size="sm">
                  {t("Create")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    case "workspaceMembers":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title={t("Workspace members")} />
          <WorkspaceMembers />
        </div>
      );
    case "workspaceInvites":
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title={t("Workspace invites")} />
          <WorkspaceInvites />
        </div>
      );
    default:
      return (
        <div className="flex flex-col h-full">
          <RightPanelHeader title={t("student.rightPanel.rightPanel")} />
          <div>RightPanel</div>
        </div>
      );
  }
}

function WorkspaceMembers() {
  const { workspaceId } = useStudent();
  const [members, setMembers] = useState<
    Array<{
      user_id: string;
      email: string;
      full_name?: string | null;
      avatar_url?: string | null;
      role: string;
    }>
  >([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!workspaceId) return;
    listMembers(workspaceId)
      .then((res) => setMembers(res.items))
      .catch(() => setMembers([]));
  }, [workspaceId]);

  if (!workspaceId) {
    return <div className="p-4 text-sm opacity-70">No workspace selected.</div>;
  }

  const totalPages = Math.max(1, Math.ceil(members.length / pageSize));
  const start = (page - 1) * pageSize;
  const current = members.slice(start, start + pageSize);

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <div className="text-sm font-medium">
          Add user by email (admin only)
        </div>
        <div className="flex gap-2">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
          <Button
            size="sm"
            onClick={async () => {
              setError("");
              try {
                await inviteUser({ workspace_id: workspaceId, email });
                setEmail("");
              } catch (e: any) {
                setError(e?.response?.data?.detail || "Invite failed");
              }
            }}
          >
            Invite
          </Button>
        </div>
        {error && <div className="text-xs text-red-500">{error}</div>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Members</div>
          <div className="flex items-center gap-2 text-xs">
            <span>Rows:</span>
            <select
              className="border rounded px-1 py-0.5 bg-background"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>

        <div className="w-full border rounded">
          <div className="grid grid-cols-[32px_1fr_1fr_100px] gap-3 px-3 py-2 text-[11px] font-medium bg-muted/40">
            <div></div>
            <div>Name</div>
            <div>Email</div>
            <div className="text-right">Role</div>
          </div>
          {current.map((m) => (
            <div
              key={m.user_id}
              className="grid grid-cols-[32px_1fr_1fr_100px] gap-3 px-3 py-2 items-center text-xs border-t"
            >
              <div>
                {m.avatar_url ? (
                  <img
                    src={m.avatar_url}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted" />
                )}
              </div>
              <div className="truncate">{m.full_name || "—"}</div>
              <div className="truncate">{m.email}</div>
              <div className="text-right opacity-70">{m.role}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 text-xs">
          <span>
            Page {page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkspaceInvites() {
  const [invites, setInvites] = useState<
    Array<{ id: string; email: string; role: string; workspace_name?: string }>
  >([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listInvites()
      .then((res) => setInvites(res.items))
      .catch(() => setInvites([]));
  }, []);

  return (
    <div className="p-4 space-y-2">
      {error && <div className="text-xs text-red-500">{error}</div>}
      {invites.length === 0 ? (
        <div className="text-sm opacity-70">No invites</div>
      ) : (
        invites.map((iv) => (
          <div
            key={iv.id}
            className="flex items-center justify-between text-xs py-2 border-b"
          >
            <span className="truncate mr-2">
              {iv.workspace_name ? `${iv.workspace_name} • ` : ""}
              {iv.email}
            </span>
            <div className="flex items-center gap-2">
              <span className="opacity-70">{iv.role}</span>
              <Button
                size="sm"
                onClick={async () => {
                  try {
                    await acceptInvite(iv.id);
                    const res = await listInvites();
                    setInvites(res.items);
                  } catch (e: any) {
                    setError(e?.response?.data?.detail || "Accept failed");
                  }
                }}
              >
                Accept
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
