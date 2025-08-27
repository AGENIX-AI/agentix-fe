import Cookies from "js-cookie";
import * as Sentry from "@sentry/react";

// Get auth headers for API calls
const getAuthHeaders = (): HeadersInit => {
  const accessToken = Cookies.get("edvara_access_token");
  const refreshToken = Cookies.get("edvara_refresh_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (refreshToken) {
    headers["X-Refresh-Token"] = refreshToken;
  }

  return headers;
};
export interface GetDocumentsParams {
  page_number?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: number;
  search?: string;
  type?:
    | "upload_document"
    | "media_document"
    | "note_collection"
    | "media_collection"
    | "online_source_collection"
    | "note_document"
    | "image"
    | "crawl_document"
    | "crawl_collection"
    | "blog_document"
    | "all";
  assistant_id?: string;
  mode?: "original" | "reference";
  only_link?: boolean;
}

// Types
export interface PageResponse {
  id: string;
  title: string;
  owner_id: string;
  url?: string | null;
  upload_status?: string | null;
  type?: string | null;
  language: string;
  mode?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PageWithContentResponse {
  page: PageResponse;
  blocks: Array<{
    id: string;
    page_id: string | null;
    order: number;
    type: string;
    data: Record<string, any>;
    created_at?: string | null;
  }>;
  stats: {
    total_blocks: number;
    total_characters: number;
    has_content: boolean;
  };
}

export interface BlockData {
  id: string | null;
  page_id: string | null;
  type: string;
  data: Record<string, any>;
  order: number;
  hash?: string | null;
}

export interface PaginatedResponse {
  items: BlockData[];
  total_items: number;
  page_number: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface GetPageBlocksParams {
  page_number?: number; // default 1
  page_size?: number; // default 20
  sort_order?: 1 | -1; // default 1
  sort_by?: string; // default "order"
  type?: string | null;
  organize_by_section?: boolean; // default true
}

export interface PageBlocksUpdateContentItem {
  id?: string | null;
  order: number;
  type: string;
  data: Record<string, any>;
}

export interface PageBlocksUpdate {
  title?: string | null;
  content?: PageBlocksUpdateContentItem[];
}

export interface BlocksDiffSummary {
  newVersion: number;
  inserted: string[];
  updated: string[];
  skipped: string[];
  deleted: string[];
}

export interface Document {
  id: string;
  user_id: string;
  url: string;
  upload_status:
    | "completed"
    | "not_complete"
    | "failed"
    | "pending"
    | "crawl_completed";
  created_at: string;
  updated_at: string;
  file_name: string;
  title: string;
  type:
    | "upload_document"
    | "media_document"
    | "note_document"
    | "crawl_document";
  linked?: boolean;
  description?: string;
  path?: string;
  language?: string;
  image_confirm?: boolean;
  base_documents?: string[];
  assistant_document?: {
    assistant_id: string;
  }[];
}

export interface GetDocumentsResponse {
  success: boolean;
  documents: Document[];
  total_items: number;
  page_number: number;
  page_size: number;
}

// Helpers
const getErrorDetail = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return data?.detail || response.statusText;
  } catch {
    return response.statusText;
  }
};

const baseUrl = import.meta.env.VITE_API_URL || "";

// API functions
export const getPage = async (
  pageId: string
): Promise<PageWithContentResponse> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${baseUrl}/pages/${pageId}`, {
    method: "GET",
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const detail = await getErrorDetail(response);
    Sentry.captureException(new Error(`Failed to get page: ${detail}`));
    throw new Error(`Failed to get page: ${detail}`);
  }

  return await response.json();
};

export const getChildPages = async (
  parentId: string
): Promise<PageResponse[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${baseUrl}/pages/${parentId}/children`, {
    method: "GET",
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const detail = await getErrorDetail(response);
    Sentry.captureException(new Error(`Failed to get child pages: ${detail}`));
    throw new Error(`Failed to get child pages: ${detail}`);
  }

  return await response.json();
};

export const getPageBlocks = async (
  pageId: string,
  params: GetPageBlocksParams = {}
): Promise<PaginatedResponse> => {
  const headers = getAuthHeaders();
  const queryParams = new URLSearchParams({
    page_number: String(params.page_number ?? 1),
    page_size: String(params.page_size ?? 20),
    sort_order: String(params.sort_order ?? 1),
    sort_by: String(params.sort_by ?? "order"),
  });

  if (params.type !== undefined && params.type !== null) {
    queryParams.append("type", params.type);
  }
  if (params.organize_by_section !== undefined) {
    queryParams.append(
      "organize_by_section",
      String(params.organize_by_section)
    );
  } else {
    queryParams.append("organize_by_section", "true");
  }

  const response = await fetch(
    `${baseUrl}/pages/${pageId}/blocks?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    const detail = await getErrorDetail(response);
    Sentry.captureException(new Error(`Failed to get page blocks: ${detail}`));
    throw new Error(`Failed to get page blocks: ${detail}`);
  }

  return await response.json();
};

export const updatePageBlocks = async (
  pageId: string,
  update: PageBlocksUpdate
): Promise<BlocksDiffSummary> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${baseUrl}/pages/${pageId}/blocks`, {
    method: "PUT",
    credentials: "include",
    headers,
    body: JSON.stringify(update),
  });

  if (!response.ok) {
    const detail = await getErrorDetail(response);
    Sentry.captureException(
      new Error(`Failed to update page blocks: ${detail}`)
    );
    throw new Error(`Failed to update page blocks: ${detail}`);
  }

  return await response.json();
};

/**
 * Delete a page by ID
 */
export const deletePage = async (
  pageId: string
): Promise<{ success: boolean }> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${baseUrl}/pages/${pageId}`, {
    method: "DELETE",
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const detail = await getErrorDetail(response);
    Sentry.captureException(new Error(`Failed to delete page: ${detail}`));
    throw new Error(`Failed to delete page: ${detail}`);
  }

  return await response.json();
};

/**
 * Get user's own documents
 * @param params Parameters for filtering and pagination
 * @returns Promise with the list of documents
 */
export const getOwnDocuments = async (
  params: GetDocumentsParams = {}
): Promise<GetDocumentsResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams();
  queryParams.append("page_number", params.page_number?.toString() ?? "1");
  queryParams.append("page_size", params.page_size?.toString() ?? "10");
  queryParams.append("sort_by", params.sort_by ?? "created_at");
  queryParams.append("sort_order", params.sort_order?.toString() ?? "1");

  if (params.search) {
    queryParams.append("search", params.search);
  }
  if (params.type) {
    queryParams.append("type", params.type);
  }
  if (params.assistant_id) {
    queryParams.append("assistant_id", params.assistant_id);
  }
  if (params.mode) {
    queryParams.append("mode", params.mode);
  }
  if (params.only_link !== undefined) {
    queryParams.append("only_link", params.only_link.toString());
  }

  const response = await fetch(
    `${baseUrl}/pages/get_own_documents?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch own documents: ${response.statusText}`)
    );
    throw new Error(`Failed to fetch own documents: ${response.statusText}`);
  }

  return await response.json();
};
