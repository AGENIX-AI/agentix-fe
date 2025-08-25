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
  type: "document" | "image" | "topic_knowledge" | "crawl_document";
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
  type?:
    | "upload_document"
    | "media_document"
    | "note_collection"
    | "media_collection"
    | "online_source_collection"
    | "topic_knowledge"
    | "image"
    | "crawl_document"
    | "crawl_collection"
    | "all";
  assistant_id?: string;
  mode?: "original" | "reference";
  only_link?: boolean;
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

/**
 * Document block interfaces for EditorJS
 */
export interface DocumentBlock {
  id: string;
  type: string;
  data: {
    text?: string;
    level?: number;
    items?: string[];
    style?: string;
    [key: string]: any;
  };
}

export interface GetDocumentBlocksParams {
  page_number?: number;
  page_size?: number;
  sort_order?: number;
  sort_by?: string;
}

export interface GetDocumentBlocksResponse {
  items: DocumentBlock[];
  total_items: number;
  page_number: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/**
 * Note Collection interfaces
 */
export interface NoteCollection {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  type: "note_collection";
}

export interface GetNoteCollectionsParams {
  page_number?: number;
  page_size?: number;
  sort_order?: number;
  sort_by?: string;
  search?: string;
  type?: "note_collection";
}

export interface GetNoteCollectionsResponse {
  success: boolean;
  collections: NoteCollection[];
  total_count: number;
  page_number: number;
  page_size: number;
}

export interface GetCollectionDocumentsParams {
  page_number?: number;
  page_size?: number;
  sort_order?: number;
  sort_by?: string;
  search?: string;
  type?: "topic_knowledge";
}

export interface GetCollectionDocumentsResponse {
  success: boolean;
  documents: Document[];
  total_count: number;
  page_number: number;
  page_size: number;
}

/**
 * Get children pages of a collection
 * Response shape is the same as getOwnDocuments
 */
export const getCollectionChildrenDocuments = async (
  collectionId: string,
  params: GetDocumentsParams = {}
): Promise<GetDocumentsResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams();
  queryParams.append("collection_id", collectionId);
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

  const response = await fetch(
    `${baseUrl}/documents/get_collection_children?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch collection children: ${response.statusText}`)
    );
    throw new Error(
      `Failed to fetch collection children: ${response.statusText}`
    );
  }

  return await response.json();
};

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
 * @param file File to upload
 * @returns Promise with the upload response
 */
export const uploadImageDocument = async (
  file: File
): Promise<{ success: boolean; description: string; url: string }> => {
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
  documentId: string,
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
      media_collection_id: documentId,
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
  title: string;
  language: string;
  framework?: string;
}): Promise<{
  success: boolean;
  message: string;
  page_id: string;
  title: string;
}> {
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

export async function createMediaCollection(data: {
  title: string;
  language: string;
}): Promise<{ success: boolean; document_id: string }> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/documents/create_media_collection`, {
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
  page_id: string;
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
  page_id: string;
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
    page_id: string;
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

/**
 * Create web derived knowledge by crawling a website
 * @param data The crawling configuration
 * @returns Promise with the success status and document_id
 */
export async function createWebDerivedKnowledge(data: {
  title: string;
  url: string;
  is_parse: boolean;
  depth: number;
  page_limit: number;
}): Promise<{ success: boolean; document_id: string }> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/documents/crawl_document`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    Sentry.captureException(
      new Error(
        `Failed to create web derived knowledge: ${response.statusText}`
      )
    );
    throw new Error(
      `Failed to create web derived knowledge: ${response.statusText}`
    );
  }

  return await response.json();
}

/**
 * Get crawled documents from a web crawl
 * @param documentId The ID of the crawl document
 * @returns Promise with the list of crawled documents
 */
export async function getCrawlDocuments(documentId: string): Promise<any[]> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/documents/get_crawl_document/${documentId}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to get crawl documents: ${response.statusText}`)
    );
    throw new Error(`Failed to get crawl documents: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Index crawled documents
 * @param documentId The ID of the crawl document
 * @param data The indexing configuration and documents to index
 * @returns Promise with the success status and message
 */
export async function indexCrawlDocument(
  documentId: string,
  data: {
    is_parse: boolean;
    docs: Array<{
      link: string;
      summary: string;
      markdown: string;
    }>;
  }
): Promise<{ success: boolean; message: string }> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/documents/index_crawl_document/${documentId}`,
    {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to index crawl document: ${response.statusText}`)
    );
    throw new Error(`Failed to index crawl document: ${response.statusText}`);
  }

  return await response.json();
}

export async function updateModeDocument(
  documentId: string,
  mode: "original" | "reference"
): Promise<{ success: boolean; message: string }> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/documents/update_mode_document/${documentId}`,
    {
      method: "PUT",
      credentials: "include",
      headers,
      body: JSON.stringify({ mode }),
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to update mode document: ${response.statusText}`)
    );
    throw new Error(`Failed to update mode document: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get crawl URLs for a given URL and depth
 * @param url The URL to crawl
 * @param depth The depth of crawling
 * @returns Promise with the list of URLs that can be crawled
 */
export async function getCrawlUrls(
  url: string,
  depth: number
): Promise<{ success: boolean; data: Array<{ url: string; depth: number }> }> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams({
    depth: depth.toString(),
    url: url,
  });

  const response = await fetch(
    `${baseUrl}/documents/crawl_document/get_crawl_urls?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to get crawl URLs: ${response.statusText}`)
    );
    throw new Error(`Failed to get crawl URLs: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Index selected URLs with a title and language
 * @param data Object containing title, language, and URLs to index
 * @returns Promise with the success status and document_id
 */
export async function indexUrls(data: {
  title: string;
  language: string;
  urls: string[];
}): Promise<{ success: boolean; document_id: string }> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/documents/crawl_document/index_urls`,
    {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to index URLs: ${response.statusText}`)
    );
    throw new Error(`Failed to index URLs: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Update document by ID
 * @param documentId The ID of the document to update
 * @param data The data to update (title, language, etc.)
 * @returns Promise with the success status and message
 */
export async function updateDocumentById(
  documentId: string,
  data: {
    title?: string;
    language?: string;
  }
): Promise<{ success: boolean; message: string }> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/documents/update_document_by_id/${documentId}`,
    {
      method: "PUT",
      credentials: "include",
      headers,
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to update document: ${response.statusText}`)
    );
    throw new Error(`Failed to update document: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get document blocks for EditorJS rendering
 * @param documentId ID of the document
 * @param params Parameters for filtering and pagination
 * @returns Promise with the list of document blocks
 */
export const getDocumentBlocks = async (
  documentId: string,
  params: GetDocumentBlocksParams = {}
): Promise<GetDocumentBlocksResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams({
    page_number: params.page_number?.toString() ?? "1",
    page_size: params.page_size?.toString() ?? "10",
    sort_order: params.sort_order?.toString() ?? "0",
    sort_by: params.sort_by ?? "order",
  });

  const response = await fetch(
    `${baseUrl}/pages/${documentId}/blocks?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch document blocks: ${response.statusText}`)
    );
    throw new Error(`Failed to fetch document blocks: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Child block item for aggregated children pages
 */
export interface PageChildBlockItem {
  id: string;
  page_id: string;
  order: number;
  type: string;
  data: Record<string, any>;
  created_at: string;
}

/**
 * Get blocks from children pages filtered by type
 * Example: type=media_document → returns image/related blocks from children
 */
export const getChildrenBlocksByType = async (
  documentId: string,
  type: string
): Promise<PageChildBlockItem[]> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams({ type });

  const response = await fetch(
    `${baseUrl}/documents/${documentId}/childrents/blocks?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(
        `Failed to fetch children blocks by type: ${response.statusText}`
      )
    );
    throw new Error(
      `Failed to fetch children blocks by type: ${response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Delete document by ID
 * @param documentId The ID of the document to delete
 * @returns Promise with the success status and message
 */
export async function deleteDocumentById(
  documentId: string
): Promise<{ success: boolean; message: string }> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/documents/delete_document_by_id/${documentId}`,
    {
      method: "DELETE",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to delete document: ${response.statusText}`)
    );
    throw new Error(`Failed to delete document: ${response.statusText}`);
  }

  return await response.json();
}
