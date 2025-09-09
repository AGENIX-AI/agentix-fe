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
