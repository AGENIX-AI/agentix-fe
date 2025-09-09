import axiosInstance from "./axios-instance";

export type WorkspaceRole = "admin" | "editor" | "viewer";

export interface WorkspaceDTO {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  is_default: boolean;
  role?: WorkspaceRole | null;
}

export interface WorkspaceListResponse {
  items: WorkspaceDTO[];
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  image_url?: string;
  is_default?: boolean;
}

export interface SwitchWorkspaceRequest {
  workspace_id: string;
}

export interface WorkspaceMember {
  user_id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: WorkspaceRole;
}

export interface WorkspaceMembersResponse {
  items: WorkspaceMember[];
}

export interface InviteUserRequest {
  workspace_id: string;
  email: string;
  role?: WorkspaceRole;
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  status: "pending" | "accepted" | "expired";
  created_at: string;
}

export interface WorkspaceInvitesResponse {
  items: WorkspaceInvite[];
}

export async function listWorkspaces(): Promise<WorkspaceListResponse> {
  const { data } = await axiosInstance.get<WorkspaceListResponse>("/workspaces/");
  return data;
}

export async function createWorkspace(
  req: CreateWorkspaceRequest
): Promise<WorkspaceListResponse> {
  const { data } = await axiosInstance.post<WorkspaceListResponse>(
    "/workspaces/",
    req
  );
  return data;
}

export async function switchWorkspace(
  req: SwitchWorkspaceRequest
): Promise<WorkspaceListResponse> {
  const { data } = await axiosInstance.post<WorkspaceListResponse>(
    "/workspaces/switch",
    req
  );
  return data;
}

export async function listMembers(
  workspaceId: string
): Promise<WorkspaceMembersResponse> {
  const { data } = await axiosInstance.get<WorkspaceMembersResponse>(
    `/workspaces/${workspaceId}/members`
  );
  return data;
}

export async function inviteUser(
  payload: InviteUserRequest
): Promise<{ success: boolean }> {
  const { data } = await axiosInstance.post<{ success: boolean }>(
    `/workspaces/${payload.workspace_id}/invite`,
    payload
  );
  return data;
}

export async function listInvites(): Promise<WorkspaceInvitesResponse> {
  const { data } = await axiosInstance.get<WorkspaceInvitesResponse>(
    `/workspaces/invites`
  );
  return data;
}

export async function acceptInvite(inviteId: string): Promise<{ success: boolean }>{
  const { data } = await axiosInstance.post<{ success: boolean }>(
    `/workspaces/invites/${inviteId}/accept`,
    {}
  );
  return data;
}
