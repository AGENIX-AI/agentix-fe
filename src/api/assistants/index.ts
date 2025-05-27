// API functions for assistants

import Cookies from "js-cookie";

// Assistant interface based on the sample response
export interface Assistant {
  id: string;
  name: string;
  tagline: string;
  image: string;
  language: string;
  base_stream_name: string | null;
  owner_id: string;
  speciality: string | null;
  created_at: string;
  updated_at: string;
  description: string;
  role: string;
}

export interface GetAssistantResponse {
  success: boolean;
  assistant: Assistant | null;
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
 * Get assistant by ID
 * @param assistantId - The ID of the assistant to fetch
 * @returns The assistant details
 */
export const getAssistantById = async (
  assistantId: string
): Promise<GetAssistantResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  try {
    const response = await fetch(`${baseUrl}/assistants/get_by_id/${assistantId}`, {
      method: "GET",
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch assistant: ${response.statusText}`);
    }

    const assistantData = await response.json();
    return {
      success: true,
      assistant: assistantData
    };
  } catch (error) {
    console.error("Error fetching assistant:", error);
    return {
      success: false,
      assistant: null
    };
  }
};
