import Cookies from "js-cookie";
import * as Sentry from "@sentry/react";

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
  language?: string;
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
  type?: "note_document";
}

export interface GetCollectionDocumentsResponse {
  success: boolean;
  documents: any[]; // Using any for now, will be Document[] from main index
  total_count: number;
  page_number: number;
  page_size: number;
}

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const accessToken = Cookies.get("agentix_access_token");
  const refreshToken = Cookies.get("agentix_refresh_token");

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
 * Get note collections
 * @param params Parameters for filtering and pagination
 * @returns Promise with the list of note collections
 */
export const getNoteCollections = async (
  params: GetNoteCollectionsParams = {}
): Promise<GetNoteCollectionsResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams({
    page_number: params.page_number?.toString() ?? "1",
    page_size: params.page_size?.toString() ?? "10",
    sort_order: params.sort_order?.toString() ?? "1",
    sort_by: params.sort_by ?? "created_at",
    ...(params.search && { search: params.search }),
    type: "note_collection",
  });

  const response = await fetch(
    `${baseUrl}/documents/get_note_collection?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch note collections: ${response.statusText}`)
    );
    throw new Error(`Failed to fetch note collections: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get documents from a specific collection
 * @param collectionId ID of the collection
 * @param params Parameters for filtering and pagination
 * @returns Promise with the list of documents in the collection
 */
export const getCollectionDocuments = async (
  collectionId: string,
  params: GetCollectionDocumentsParams = {}
): Promise<GetCollectionDocumentsResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams({
    page_number: params.page_number?.toString() ?? "1",
    page_size: params.page_size?.toString() ?? "10",
    sort_order: params.sort_order?.toString() ?? "1",
    sort_by: params.sort_by ?? "created_at",
    ...(params.search && { search: params.search }),
    type: "note_document",
  });

  const response = await fetch(
    `${baseUrl}/documents/get_documents/collection/${collectionId}?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch collection documents: ${response.statusText}`)
    );
    throw new Error(
      `Failed to fetch collection documents: ${response.statusText}`
    );
  }

  return await response.json();
};
