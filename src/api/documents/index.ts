import Cookies from "js-cookie";
import * as Sentry from "@sentry/react";

/**
 * Parameters for getting documents
 */
export interface ImageDocument {
  id?: string;
  chunk_index: string;
  title: string;
  keywords: string[];
  summary: string;
  content: string;
  url: string;
  type: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
}

export interface GetImageDocumentsParams {
  page_number?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: number;
  search?: string;
}

export interface GetImageDocumentsResponse {
  success: boolean;
  documents: ImageDocument[];
  document_id: string;
  total_items: number;
  page_number: number;
  page_size: number;
}

export interface Document {
  id: string;
  user_id: string;
  url: string;
  upload_status: "completed" | "not_complete" | "failed" | "pending";
  created_at: string;
  updated_at: string;
  file_name: string;
  title: string;
  type: "document" | "image" | "topic_knowledge";
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

export interface GetDocumentsParams {
  page_number?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: number;
  search?: string;
  type?: "document" | "image" | "topic_knowledge" | "all";
  assistant_id?: string;
}

export interface GetAssistantDocumentsParams extends GetDocumentsParams {}

export interface GetDocumentsResponse {
  success: boolean;
  documents: Document[];
  total_items: number;
  page_number: number;
  page_size: number;
}

export interface GetAssistantDocumentsResponse extends GetDocumentsResponse {}

// Helper function to get auth headers
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

/**
 * Get image documents associated with a character (assistant)
 * @param characterId ID of the character
 * @param params Parameters for filtering and pagination
 * @returns Promise with the list of image documents
 */
export const getImageDocuments = async (
  characterId: string,
  params: GetImageDocumentsParams = {}
): Promise<GetImageDocumentsResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams({
    page_number: params.page_number?.toString() ?? "1",
    page_size: params.page_size?.toString() ?? "10",
    sort_by: params.sort_by ?? "chunk_index",
    sort_order: params.sort_order?.toString() ?? "1",
    ...(params.search && { search: params.search }),
  });

  const response = await fetch(
    `${baseUrl}/documents/get_image_documents/${characterId}?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch image documents: ${response.statusText}`)
    );
    throw new Error(`Failed to fetch image documents: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get image document by document ID
 * @param documentId ID of the document
 * @param params Parameters for filtering and pagination
 * @returns Promise with the list of image documents
 */
export const getImageDocument = async (
  documentId: string,
  params: GetImageDocumentsParams = {}
): Promise<GetImageDocumentsResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams({
    page_number: params.page_number?.toString() ?? "1",
    page_size: params.page_size?.toString() ?? "10",
    sort_by: params.sort_by ?? "chunk_index",
    sort_order: params.sort_order?.toString() ?? "1",
    ...(params.search && { search: params.search }),
  });

  const response = await fetch(
    `${baseUrl}/documents/get_image_document/${documentId}?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch image document: ${response.statusText}`)
    );
    throw new Error(`Failed to fetch image document: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Upload an image document
 * @param documentId ID of the document
 * @param file File to upload
 * @returns Promise with the upload response
 */
export const uploadImageDocument = async (
  documentId: string,
  file: File
): Promise<{ success: boolean; description: string; url: string }> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const formData = new FormData();
  formData.append("file", file);

  const accessToken = Cookies.get("edvara_access_token");
  const headers: HeadersInit = {};

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${baseUrl}/documents/upload_image_document/${documentId}`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
      headers,
      // Don't set Content-Type, browser will set it with boundary
    }
  );

  if (!response.ok) {
    const data = await response.json();
    console.error("Upload failed:", data);
    Sentry.captureException(
      new Error(`Failed to upload image document: ${response.statusText}`)
    );
    throw new Error(
      data.error || `Failed to upload image document: ${response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Upload a document without requiring a document ID
 * @param file File to upload
 * @returns Promise with the upload response including success status, description, title, and URL
 */
export const uploadDocument = async (
  file: File
): Promise<{
  success: boolean;
  description: string;
  title: string;
  url: string;
}> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const formData = new FormData();
  formData.append("file", file);

  const accessToken = Cookies.get("edvara_access_token");
  const refreshToken = Cookies.get("edvara_refresh_token");
  const headers: HeadersInit = {};

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (refreshToken) {
    headers["X-Refresh-Token"] = refreshToken;
  }

  const response = await fetch(`${baseUrl}/documents/upload_image_document`, {
    method: "POST",
    credentials: "include",
    body: formData,
    headers,
    // Don't set Content-Type, browser will set it with boundary
  });

  if (!response.ok) {
    const data = await response.json();
    console.error("Upload failed:", data);
    Sentry.captureException(
      new Error(`Failed to upload document: ${response.statusText}`)
    );
    throw new Error(
      data.error || `Failed to upload document: ${response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Upload a document file (PDF, DOC, etc.)
 * @param file File to upload
 * @param title Title for the document
 * @param isParse Whether to parse the document
 * @returns Promise with the upload response including success status, message, and document_id
 */
export const uploadDocumentFile = async (
  file: File,
  title: string,
  isParse: boolean
): Promise<{ success: boolean; message: string; document_id: string }> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("is_parse", String(isParse));

  const accessToken = Cookies.get("edvara_access_token");
  const refreshToken = Cookies.get("edvara_refresh_token");
  const headers: HeadersInit = {};

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (refreshToken) {
    headers["X-Refresh-Token"] = refreshToken;
  }

  const response = await fetch(`${baseUrl}/documents/upload_document`, {
    method: "POST",
    credentials: "include",
    body: formData,
    headers,
    // Don't set Content-Type, browser will set it with boundary
  });

  if (!response.ok) {
    const data = await response.json();
    console.error("Upload failed:", data);
    Sentry.captureException(
      new Error(`Failed to upload document: ${response.statusText}`)
    );
    throw new Error(
      data.error || `Failed to upload document: ${response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Create an image index with description and title
 * @param assistantId ID of the assistant
 * @param description Description for the image
 * @param title Title for the image
 * @param url URL of the image
 * @returns Promise with the success status, document_id and chunk_index
 */
export const createImageIndex = async (
  assistantId: string,
  description: string,
  title: string,
  url: string
): Promise<{ success: boolean; document_id: string; chunk_index: string }> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/documents/create_image_index`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({
      assistant_id: assistantId,
      description,
      title,
      url,
    }),
  });

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to create image index: ${response.statusText}`)
    );
    throw new Error(`Failed to create image index: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get documents associated with an assistant
 * @param assistantId ID of the assistant
 * @param params Parameters for filtering and pagination
 * @returns Promise with the list of documents
 */
export const getAssistantDocuments = async (
  assistantId: string,
  params: GetAssistantDocumentsParams = {}
): Promise<GetAssistantDocumentsResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams({
    page_number: params.page_number?.toString() ?? "1",
    page_size: params.page_size?.toString() ?? "10",
    sort_by: params.sort_by ?? "created_at",
    sort_order: params.sort_order?.toString() ?? "1",
    ...(params.search && { search: params.search }),
    ...(params.type && { type: params.type }),
  });

  const response = await fetch(
    `${baseUrl}/documents/get_assisstant_documents/${assistantId}?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch assistant documents: ${response.statusText}`)
    );
    throw new Error(
      `Failed to fetch assistant documents: ${response.statusText}`
    );
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

  const queryParams = new URLSearchParams({
    page_number: params.page_number?.toString() ?? "1",
    page_size: params.page_size?.toString() ?? "10",
    sort_by: params.sort_by ?? "created_at",
    sort_order: params.sort_order?.toString() ?? "1",
    ...(params.search && { search: params.search }),
    ...(params.type && { type: params.type }),
    ...(params.assistant_id && { assistant_id: params.assistant_id }),
  });

  const response = await fetch(
    `${baseUrl}/documents/get_own_documents?${queryParams.toString()}`,
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

/**
 * Link a document to an assistant
 */
export async function linkDocument(documentId: string, assistantId: string) {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/documents/link_document`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({
      document_id: documentId,
      assistant_id: assistantId,
    }),
  });

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to link document: ${response.statusText}`)
    );
    throw new Error(`Failed to link document: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Unlink a document from an assistant
 */
export async function unlinkDocument(documentId: string, assistantId: string) {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/documents/unlink_document`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({
      document_id: documentId,
      assistant_id: assistantId,
    }),
  });

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to unlink document: ${response.statusText}`)
    );
    throw new Error(`Failed to unlink document: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Topic Knowledge Item interface
 */
export interface TopicKnowledgeItem {
  chunk_index: string;
  title: string;
  keywords: string[];
  summary: string;
  content: string;
  type: string;
}

/**
 * Get topic knowledge reference documents
 */
export async function getTopicKnowledgeReferenceDocuments(
  topicKnowledgeId: string
): Promise<{ success: boolean; documents: Document[] }> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/documents/topic_knowledge/reference/${topicKnowledgeId}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(
        `Failed to fetch topic knowledge reference documents: ${response.statusText}`
      )
    );
    throw new Error(
      `Failed to fetch topic knowledge reference documents: ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Get topic knowledge items with pagination
 */
export async function getTopicKnowledgeItems(
  topicKnowledgeId: string,
  params: {
    page_number?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: number;
    search?: string;
  } = {}
): Promise<{
  success: boolean;
  items: TopicKnowledgeItem[];
  page_size: number;
  page_number: number;
  total_items: number;
}> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams({
    page_number: params.page_number?.toString() ?? "1",
    page_size: params.page_size?.toString() ?? "10",
    sort_by: params.sort_by ?? "chunk_index",
    sort_order: params.sort_order?.toString() ?? "1",
    ...(params.search && { search: params.search }),
  });

  const response = await fetch(
    `${baseUrl}/documents/topic_knowledge/${topicKnowledgeId}?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch topic knowledge items: ${response.statusText}`)
    );
    throw new Error(
      `Failed to fetch topic knowledge items: ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Create knowledge component
 */
export async function createTopicKnowledge(data: {
  base_documents: string[];
  title: string;
  language: string;
  framework?: string;
}): Promise<{ success: boolean; document_id: string }> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/documents/create_topic_knowledge`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to create topic knowledge: ${response.statusText}`)
    );
    throw new Error(`Failed to create topic knowledge: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Create topic knowledge manually
 */
export async function createTopicKnowledgeManual(data: {
  document_id: string;
  title: string;
  content: string;
  ai_parse?: boolean;
}): Promise<{
  success: boolean;
  output: {
    success: boolean;
    output: TopicKnowledgeItem;
  };
}> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/documents/topic_knowledge/manual_create`,
    {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(
        `Failed to create manual topic knowledge: ${response.statusText}`
      )
    );
    throw new Error(
      `Failed to create manual topic knowledge: ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Framework enum type
 */
export type Framework = "FWOH" | "PESTEL" | "SWOT" | "BLOOMTAXONOMY";

/**
 * Create topic knowledge using framework
 */
export async function createTopicKnowledgeFramework(data: {
  document_id: string;
  framework: Framework;
}): Promise<{
  success: boolean;
  output: TopicKnowledgeItem[];
}> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/documents/topic_knowledge/framework_create`,
    {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(
        `Failed to create framework topic knowledge: ${response.statusText}`
      )
    );
    throw new Error(
      `Failed to create framework topic knowledge: ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Modify topic knowledge item
 */
export async function modifyTopicKnowledge(
  chunkIndex: string,
  data: {
    title: string;
    content: string;
    document_id: string;
  }
): Promise<{
  success: boolean;
  response: {
    success: boolean;
    output: TopicKnowledgeItem;
  };
}> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/documents/topic_knowledge/modify_topic_knowledge/${chunkIndex}`,
    {
      method: "PUT",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to modify topic knowledge: ${response.statusText}`)
    );
    throw new Error(`Failed to modify topic knowledge: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Delete topic knowledge item
 */
export async function deleteTopicKnowledge(chunkIndex: string): Promise<{
  success: boolean;
  message: string;
}> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/documents/topic_knowledge/delete_topic_knowledge/${chunkIndex}`,
    {
      method: "DELETE",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to delete knowledge component: ${response.statusText}`)
    );
    throw new Error(
      `Failed to delete knowledge component: ${response.statusText}`
    );
  }

  return await response.json();
}
