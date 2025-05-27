// API functions for instructor data

export interface InstructorProfile {
  user_id: string;
  instructor_name: string;
  instructor_description: string;
  profile_image: string;
  background_image: string;
  payment_info: string;
  created_at: string;
  updated_at: string;
  id: string;
}

export interface InstructorAssistant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string | null;
  language: string;
}

export interface GetInstructorsResponse {
  instructors: InstructorProfile[];
  total_count: number;
  page_number: number;
  page_size: number;
}

interface GetInstructorsParams {
  page_number: number;
  page_size: number;
  sort_by?: string;
  sort_order?: number;
  search?: string;
}

import Cookies from "js-cookie";

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

export const getInstructors = async (
  params: GetInstructorsParams
): Promise<GetInstructorsResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/instructor-profiles/get-instructor?${queryParams.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch instructors: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get instructor profile by ID
 * @param instructorId - The ID of the instructor to fetch
 * @returns The instructor profile
 */
export const getInstructorById = async (
  instructorId: string
): Promise<InstructorProfile> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/instructor-profiles/get-instructor-by-id/${instructorId}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch instructor: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get instructor assistants
 * @param instructorId - The ID of the instructor whose assistants to fetch
 * @returns An array of instructor assistants
 */
export const getInstructorAssistants = async (
  instructorId: string
): Promise<InstructorAssistant[]> => {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const headers = getAuthHeaders();

  const response = await fetch(
    `${baseUrl}/instructor-profiles/get-instructor-assistants/${instructorId}`,
    {
      method: "GET",
      credentials: "include",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch instructor assistants: ${response.statusText}`);
  }

  return await response.json();
};
