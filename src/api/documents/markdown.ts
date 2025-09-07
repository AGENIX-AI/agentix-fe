import Cookies from "js-cookie";
import * as Sentry from "@sentry/react";

export interface MarkdownResponse {
  success: boolean;
  path: string;
  content: string;
  size: number;
}

export interface EditDocumentResponse {
  success: boolean;
  message: string;
  path: string;
  content_length: number;
  original_content_length: number;
}

export interface MagicEditDocumentResponse {
  success: boolean;
  new_content: string;
}

export interface SubmitDocumentResponse {
  success: boolean;
  message: string;
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

const getBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL || "";
};

/**
 * Get markdown file content
 * @param path Path to the markdown file
 * @returns Promise with the markdown file content
 */
export const getMarkdownFile = async (
  path: string
): Promise<MarkdownResponse> => {
  const baseUrl = getBaseUrl();
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/documents/get_markdown_file?path=${encodeURIComponent(path)}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to fetch markdown file: ${response.statusText}`)
    );
    throw new Error(`Failed to fetch markdown file: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Update markdown file content
 * @param path Path to the markdown file
 * @param content New content for the file
 * @returns Promise with the update response
 */
export const updateMarkdownFile = async (
  path: string,
  content: string
): Promise<{ success: boolean }> => {
  const baseUrl = getBaseUrl();
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/documents/update_markdown_file`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      path,
      content,
    }),
  });

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to update markdown file: ${response.statusText}`)
    );
    throw new Error(`Failed to update markdown file: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Edit document content
 * @param documentPath Path to the document file
 * @param editContent New content for the file
 * @returns Promise with the edit response
 */
export const editDocument = async (
  documentPath: string,
  editContent: string
): Promise<EditDocumentResponse> => {
  const baseUrl = getBaseUrl();
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/documents/edit_document`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      document_path: documentPath,
      edit_content: editContent,
    }),
  });

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to edit document: ${response.statusText}`)
    );
    throw new Error(`Failed to edit document: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Magic edit document content using AI
 * @param documentPath Path to the document file
 * @param editContent Edit instruction for AI
 * @returns Promise with the magic edit response containing the new content
 */
export const magicEditDocument = async (
  documentPath: string,
  editContent: string
): Promise<MagicEditDocumentResponse> => {
  const baseUrl = getBaseUrl();
  const headers = getAuthHeaders();

  const response = await fetch(`${baseUrl}/documents/magic/edit_document`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      document_path: documentPath,
      edit_content: editContent,
    }),
  });

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to magic edit document: ${response.statusText}`)
    );
    throw new Error(`Failed to magic edit document: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Submit learning document
 * @param documentPath Path to the document file
 * @param conversationId ID of the conversation related to the document
 * @returns Promise with the submit response
 */
export const submitLearningDocument = async (
  documentPath: string,
  conversationId: string
): Promise<SubmitDocumentResponse> => {
  const baseUrl = getBaseUrl();
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/documents/submit_learning_document`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        conversation_id: conversationId,
        document_path: documentPath,
      }),
    }
  );

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to submit document: ${response.statusText}`)
    );
    throw new Error(`Failed to submit document: ${response.statusText}`);
  }

  return await response.json();
};
