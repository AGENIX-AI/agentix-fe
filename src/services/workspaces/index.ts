import axios from "axios";
import Cookies from "js-cookie";
import type {
  WorkspaceListResponse,
  CreateWorkspaceRequest,
  SwitchWorkspaceRequest,
} from "./types";

const baseUrl = `${import.meta.env.VITE_API_URL}/workspaces`;

function authHeaders() {
  const accessToken = Cookies.get("agentix_access_token");
  const refreshToken = Cookies.get("agentix_refresh_token");
  return {
    Authorization: `Bearer ${accessToken}`,
    "X-Refresh-Token": refreshToken,
  } as Record<string, string | undefined>;
}

export const workspaceService = {
  async list(): Promise<WorkspaceListResponse> {
    const { data } = await axios.get(`${baseUrl}/`, {
      headers: authHeaders(),
    });
    return data;
  },

  async create(req: CreateWorkspaceRequest): Promise<WorkspaceListResponse> {
    const { data } = await axios.post(`${baseUrl}/`, req, {
      headers: authHeaders(),
    });
    return data;
  },

  async switch(req: SwitchWorkspaceRequest): Promise<WorkspaceListResponse> {
    const { data } = await axios.post(`${baseUrl}/switch/`, req, {
      headers: authHeaders(),
    });
    return data;
  },
};
