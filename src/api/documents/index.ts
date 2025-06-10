import Cookies from "js-cookie";

/**
 * Parameters for getting documents
 */
export interface ImageDocument {
  id: string;
  description: string;
  url: string;
  created_at: string;
  updated_at: string;
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
  filename: string | null;
  url: string;
  upload_status: "completed" | "not_complete" | "failed";
  created_at: string;
  updated_at: string;
  file_name: string;
  title: string;
  assistant_id: string;
}

export interface GetAssistantDocumentsParams {
  page_number?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: number;
  search?: string;
}

export interface GetAssistantDocumentsResponse {
  success: boolean;
  documents: Document[];
  total_items: number;
  page_number: number;
  page_size: number;
}

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
    throw new Error(`Failed to fetch image documents: ${response.statusText}`);
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
    throw new Error(
      data.error || `Failed to upload image document: ${response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Create an image index with description
 * @param assistantId ID of the assistant
 * @param description Description for the image
 * @param url URL of the image
 * @returns Promise with the success status
 */
export const createImageIndex = async (
  assistantId: string,
  description: string,
  url: string
): Promise<{ success: boolean }> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/documents/create_image_index`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({
      assistant_id: assistantId,
      description,
      url,
    }),
  });

  if (!response.ok) {
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
    throw new Error(`Failed to fetch assistant documents: ${response.statusText}`);
  }

  return await response.json();
};
