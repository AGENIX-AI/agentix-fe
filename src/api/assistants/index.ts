// API functions for assistants

import Cookies from "js-cookie";

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
  let headers = getAuthHeaders();

  const baseUrl = import.meta.env.VITE_API_URL || "";

  const response = await fetch(`${baseUrl}/assistants/generate_capability`, {
    method: "POST",
    body: JSON.stringify({ name, tagline, description, language }),
    credentials: "include",
    headers: headers,
  });

  const data = await response.json();

  if (!response.ok) {
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
    console.error("Generate image failed:", data);
    throw new Error(data.error || "Failed to generate image");
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
    console.error("Create assistant failed:", data);
    throw new Error(data.error || "Failed to create assistant");
  }

  return data;
}
