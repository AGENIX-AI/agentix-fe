import Cookies from "js-cookie";
import * as Sentry from "@sentry/react";

/**
 * Help document topic interface
 */
export interface HelpTopicItem {
  topic: string;
  show_text: string;
}

/**
 * Help document interface
 */
export interface HelpDocument {
  main_topic: string;
  show_text: string;
  children_topic: HelpTopicItem[];
}

/**
 * Response for getting help documents
 */
export interface GetHelpDocumentsResponse {
  success: boolean;
  data: HelpDocument[];
}

/**
 * Help content interface
 */
export interface HelpContent {
  topic: string;
  show_text: string;
  content: string;
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
 * Get help documents
 * @returns Promise with the list of help documents
 */
export const getHelpDocuments = async (): Promise<HelpDocument[]> => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8002";
  const headers = getAuthHeaders();

  try {
    const response = await fetch(`${baseUrl}/systems/help_documents`, {
      method: "GET",
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      Sentry.captureException(
        new Error(`Failed to fetch help documents: ${response.statusText}`)
      );
      throw new Error(`Failed to fetch help documents: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching help documents:", error);
    return [];
  }
};

/**
 * Get help content for a specific topic
 * @param topic The topic to fetch content for
 * @returns Promise with the help content
 */
export const getHelpContent = async (topic: string): Promise<HelpContent> => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8002";
  const headers = getAuthHeaders();

  try {
    const response = await fetch(`${baseUrl}/systems/help_content/${topic}`, {
      method: "GET",
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      Sentry.captureException(
        new Error(`Failed to fetch help content: ${response.statusText}`)
      );
      throw new Error(`Failed to fetch help content: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    Sentry.captureException(error);
    console.error(`Error fetching help content for ${topic}:`, error);
    throw error;
  }
};
