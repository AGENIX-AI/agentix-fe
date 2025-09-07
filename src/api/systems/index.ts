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

/**
 * Feedback type constants
 */
export const FeedbackType = {
  BUG: "Bug report",
  FEATURE_REQUEST: "Feature request",
  IMPROVEMENT: "Improvement",
  GENERAL: "General feedback",
} as const;

export type FeedbackType = (typeof FeedbackType)[keyof typeof FeedbackType];

/**
 * Feedback request interface
 */
export interface FeedbackRequest {
  feedback_type: FeedbackType;
  description: string;
  rating?: number;
}

/**
 * Feedback response interface
 */
export interface FeedbackResponse {
  id: string;
  feedback_type: string;
  description: string;
  rating?: number;
  screenshot_urls: string[];
  user_id: string;
  created_at: string;
  message: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const accessToken = Cookies.get("agentix_access_token");
  const refreshToken = Cookies.get("agentix_refresh_token");

  const headers: Record<string, string> = {
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

/**
 * Submit feedback
 * @param feedbackData The feedback data to submit
 * @param screenshots Optional screenshot files
 * @returns Promise with the feedback response
 */
export const submitFeedback = async (
  feedbackData: FeedbackRequest,
  screenshots?: File[]
): Promise<FeedbackResponse> => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8002";
  const headers = getAuthHeaders();

  try {
    const formData = new FormData();

    // Add feedback data
    formData.append("feedback_type", feedbackData.feedback_type);
    formData.append("description", feedbackData.description);

    if (feedbackData.rating) {
      formData.append("rating", feedbackData.rating.toString());
    }

    // Add screenshots if provided
    if (screenshots && screenshots.length > 0) {
      screenshots.forEach((file) => {
        formData.append("screenshots", file);
      });
    }

    // Debug log
    console.log("Submitting feedback with data:", {
      feedback_type: feedbackData.feedback_type,
      description: feedbackData.description,
      rating: feedbackData.rating,
      screenshots_count: screenshots?.length || 0,
    });

    // Remove Content-Type header for FormData (browser will set it automatically with boundary)
    const formHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      if (key !== "Content-Type") {
        formHeaders[key] = value as string;
      }
    });

    const response = await fetch(`${baseUrl}/systems/feedback`, {
      method: "POST",
      credentials: "include",
      headers: formHeaders,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Feedback submission failed:", {
        status: response.status,
        statusText: response.statusText,
        response: errorText,
      });
      Sentry.captureException(
        new Error(`Failed to submit feedback: ${response.statusText}`)
      );
      throw new Error(`Failed to submit feedback: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error submitting feedback:", error);
    throw error;
  }
};
