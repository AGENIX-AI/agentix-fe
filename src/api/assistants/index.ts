// API functions for assistants

import Cookies from "js-cookie";
import * as Sentry from "@sentry/react";

// Assistant interface based on the sample response
export interface PersonalityStyle {
  id: string;
  voice: string;
  created_at: string;
  mood_style: number;
  assistant_id: string;
  formality_style: number;
  instruction_style: number;
  assertiveness_style: number;
  communication_style: number;
  response_length_style: number;
}

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
  personality: PersonalityStyle;
}

export interface GetAssistantResponse {
  success: boolean;
  assistant: Assistant | null;
}
export interface GenerateCapabilitiesResponse {
  success: boolean;
  capability_statement: {
    speciality: string;
    capabilities: string[];
  };
}
/**
 * Parameters for updating an assistant/character
 */
export interface UpdateAssistantParams {
  name?: string;
  tagline?: string;
  description?: string;
  personality?: {
    instruction_style?: number;
    communication_style?: number;
    response_length_style?: number;
    formality_style?: number;
    assertiveness_style?: number;
    mood_style?: number;
  };
  image?: string;
  agent_image?: string;
  language?: string;
  speciality?: string;
}

/**
 * Response for the update assistant endpoint
 */
export interface UpdateAssistantResponse {
  success: boolean;
  message: string;
}

/**
 * Response for the upload image endpoint
 */
export interface UploadImageResponse {
  success: boolean;
  image_path: string;
}

/**
 * Response for the generate image endpoint
 */
export interface GenerateImageResponse {
  success: boolean;
  image_base64: string;
}

/**
 * Response for the generate tagline endpoint
 */
export interface GenerateTaglineResponse {
  success: boolean;
  tagline: string;
}

/**
 * Response for the generate description endpoint
 */
export interface GenerateDescriptionResponse {
  success: boolean;
  description: string;
}

/**
 * Interface for creating a new assistant
 */
export interface CreateAssistantParams {
  name: string;
  tagline: string;
  description: string;
  language: string;
}
/**
 * Response for creating a new assistant
 */
export interface CreateAssistantResponse {
  success: boolean;
  assistant_id: string;
  conversation_id: string;
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
    const response = await fetch(
      `${baseUrl}/assistants/get_by_id/${assistantId}?have_personality=True`,
      {
        method: "GET",
        credentials: "include",
        headers,
      }
    );

    if (!response.ok) {
      Sentry.captureException(
        new Error(`Failed to fetch assistant: ${response.statusText}`)
      );
      throw new Error(`Failed to fetch assistant: ${response.statusText}`);
    }

    const assistantData = await response.json();
    return {
      success: true,
      assistant: assistantData,
    };
  } catch (error) {
    console.error("Error fetching assistant:", error);
    return {
      success: false,
      assistant: null,
    };
  }
};

export async function generateAssistantCapabilities(
  name: string,
  tagline: string,
  description: string,
  language = "English"
): Promise<GenerateCapabilitiesResponse> {
  const headers = getAuthHeaders();

  const baseUrl = import.meta.env.VITE_API_URL || "";

  const response = await fetch(`${baseUrl}/assistants/generate_capability`, {
    method: "POST",
    body: JSON.stringify({ name, tagline, description, language }),
    credentials: "include",
    headers: headers,
  });

  const data = await response.json();

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to generate capabilities: ${response.statusText}`)
    );
    console.error("Generate capabilities failed:", data);
    throw new Error(data.error || "Failed to generate capabilities");
  }

  return data;
}

export async function updateAssistant(
  characterId: string,
  params: UpdateAssistantParams
): Promise<UpdateAssistantResponse> {
  const headers = getAuthHeaders();
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const response = await fetch(`${baseUrl}/assistants/${characterId}`, {
    method: "PUT",
    body: JSON.stringify(params),
    credentials: "include",
    headers: headers,
  });

  const data = await response.json();

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to update assistant: ${response.statusText}`)
    );
    console.error("Update assistant failed:", data);
    throw new Error(data.error || "Failed to update assistant");
  }

  return data;
}

export async function uploadAssistantImage(
  imageFile: File
): Promise<UploadImageResponse> {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    // Get auth headers but omit Content-Type
    const authHeaders = getAuthHeaders();
    const { Authorization, "X-Refresh-Token": refreshToken } =
      authHeaders as any;

    // Create new headers without Content-Type
    const headers: HeadersInit = {};
    if (Authorization) headers.Authorization = Authorization;
    if (refreshToken) headers["X-Refresh-Token"] = refreshToken;

    const baseUrl = import.meta.env.VITE_API_URL || "";

    // Browser will set correct Content-Type with boundary for FormData
    const response = await fetch(`${baseUrl}/assistants/upload_image`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: headers,
    });

    const data = await response.json();

    if (!response.ok) {
      Sentry.captureException(
        new Error(`Failed to upload image: ${response.statusText}`)
      );
      console.error("Upload failed:", data);
      throw new Error(data.error || "Image upload failed");
    }

    return data;
  } catch (error) {
    console.error("Error uploading image document:", error);
    throw new Error("Error uploading image document");
  }
}

export async function generateAssistantImage(
  name: string,
  tagline: string,
  description: string,
  style: string
): Promise<GenerateImageResponse> {
  const headers = getAuthHeaders();
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const response = await fetch(`${baseUrl}/assistants/generate_image`, {
    method: "POST",
    body: JSON.stringify({ name, tagline, description, style }),
    credentials: "include",
    headers: headers,
  });

  const data = await response.json();

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to generate image: ${response.statusText}`)
    );
    console.error("Generate image failed:", data);
    throw new Error(data.error || "Failed to generate image");
  }

  return data;
}

/**
 * Generate assistant tagline using AI
 * @param name - Assistant name
 * @param description - Assistant description
 * @param language - Language for generation
 * @returns Promise with the generated tagline
 */
export async function generateAssistantTagline(
  name: string,
  description: string,
  language: string
): Promise<GenerateTaglineResponse> {
  const headers = getAuthHeaders();
  const baseUrl = import.meta.env.VITE_API_URL || "";

  const response = await fetch(`${baseUrl}/assistants/generate_assistant_tagline`, {
    method: "POST",
    body: JSON.stringify({ name, description, language }),
    credentials: "include",
    headers: headers,
  });

  const data = await response.json();

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to generate tagline: ${response.statusText}`)
    );
    console.error("Generate tagline failed:", data);
    throw new Error(data.error || "Failed to generate tagline");
  }

  return data;
}

/**
 * Generate assistant description using AI
 * @param name - Assistant name
 * @param tagline - Assistant tagline
 * @param language - Language for generation
 * @returns Promise with the generated description
 */
export async function generateAssistantDescription(
  name: string,
  tagline: string,
  language: string
): Promise<GenerateDescriptionResponse> {
  const headers = getAuthHeaders();
  const baseUrl = import.meta.env.VITE_API_URL || "";

  const response = await fetch(`${baseUrl}/assistants/generate_assistant_description`, {
    method: "POST",
    body: JSON.stringify({ name, tagline, language }),
    credentials: "include",
    headers: headers,
  });

  const data = await response.json();

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to generate description: ${response.statusText}`)
    );
    console.error("Generate description failed:", data);
    throw new Error(data.error || "Failed to generate description");
  }

  return data;
}

export async function createAssistant(
  params: CreateAssistantParams
): Promise<CreateAssistantResponse> {
  const headers = getAuthHeaders();
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const response = await fetch(`${baseUrl}/assistants/`, {
    method: "POST",
    body: JSON.stringify(params),
    credentials: "include",
    headers: headers,
  });

  const data = await response.json();

  if (!response.ok) {
    Sentry.captureException(
      new Error(`Failed to create assistant: ${response.statusText}`)
    );
    console.error("Create assistant failed:", data);
    throw new Error(data.error || "Failed to create assistant");
  }

  return data;
}

/**
 * Interface for get my assistants response
 */
export interface GetMyAssistantsResponse {
  success: boolean;
  assistants: Assistant[];
  total_count: number;
  page_number: number;
  page_size: number;
}

/**
 * Parameters for getting my assistants
 */
export interface GetMyAssistantsParams {
  page_number?: number;
  page_size?: number;
  sort_order?: number;
  sort_by?: string;
  search?: string;
  have_personality?: boolean;
  have_last_message?: boolean;
}

/**
 * Get my assistants with search and pagination
 * @param params - Parameters for filtering and pagination
 * @returns Promise with the list of assistants
 */
export const getMyAssistants = async (
  params: GetMyAssistantsParams = {}
): Promise<GetMyAssistantsResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const queryParams = new URLSearchParams({
    page_number: params.page_number?.toString() ?? "1",
    page_size: params.page_size?.toString() ?? "10",
    sort_order: params.sort_order?.toString() ?? "-1",
    sort_by: params.sort_by ?? "created_at",
    search: params.search ?? "",
    have_personality: params.have_personality?.toString() ?? "false",
    have_last_message: params.have_last_message?.toString() ?? "false",
  });

  try {
    const response = await fetch(
      `${baseUrl}/assistants/get_my_assistants?${queryParams.toString()}`,
      {
        method: "GET",
        credentials: "include",
        headers,
      }
    );

    if (!response.ok) {
      Sentry.captureException(
        new Error(`Failed to fetch my assistants: ${response.statusText}`)
      );
      throw new Error(`Failed to fetch my assistants: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching my assistants:", error);
    throw error;
  }
};

/**
 * Interface for assistant stats response
 */
export interface AssistantStatsResponse {
  success: boolean;
  conversation_counts_by_type: Record<string, number>;
  students_count: number;
  documents_count: number;
}

/**
 * Get statistics for a specific assistant
 * @param assistantId - ID of the assistant
 * @returns Promise with the assistant stats
 */
export const getAssistantStats = async (
  assistantId: string
): Promise<AssistantStatsResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  try {
    const response = await fetch(`${baseUrl}/assistants/stats/${assistantId}`, {
      method: "GET",
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      Sentry.captureException(
        new Error(`Failed to fetch assistant stats: ${response.statusText}`)
      );
      throw new Error(
        `Failed to fetch assistant stats: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching assistant stats:", error);
    throw error;
  }
};
