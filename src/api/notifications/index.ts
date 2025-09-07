import Cookies from "js-cookie";
import * as Sentry from "@sentry/react";
import type { Notification } from "@/components/custom/NotificationCenter";

// Get auth headers for API calls
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

interface BackendNotification {
  id?: string;
  _id?: string;
  title?: string;
  subject?: string;
  message?: string;
  content?: string;
  type?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
  created_at?: string;
  actionUrl?: string;
}

// Transform backend notification to our format
const transformBackendNotification = (
  backendNotification: BackendNotification
): Notification => {
  return {
    id: backendNotification.id || backendNotification._id || "",
    title:
      backendNotification.title ||
      backendNotification.subject ||
      "Notification",
    message: backendNotification.message || backendNotification.content || "",
    type: getNotificationType(backendNotification.type),
    isRead: backendNotification.isRead || backendNotification.read || false,
    createdAt:
      backendNotification.createdAt ||
      backendNotification.created_at ||
      new Date().toISOString(),
    actionUrl: backendNotification.actionUrl,
  };
};

// Map notification types
const getNotificationType = (type?: string): Notification["type"] => {
  switch (type?.toLowerCase()) {
    case "success":
    case "achievement":
    case "completion":
      return "success";
    case "warning":
    case "reminder":
      return "warning";
    case "error":
    case "failure":
    case "alert":
      return "error";
    case "info":
    case "update":
    case "announcement":
    default:
      return "info";
  }
};

// API Response types
export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export interface NotificationActionResponse {
  success: boolean;
  message: string;
}

/**
 * Fetch user notifications via backend proxy
 * @param subscriberId - User's subscriber ID
 * @param page - Page number for pagination
 * @param limit - Number of notifications per page
 * @param unread_only - Whether to fetch only unread notifications
 * @returns Promise with notifications data
 */
export const fetchNotifications = async (
  subscriberId: string,
  page: number = 1,
  limit: number = 20,
  unread_only: boolean = false
): Promise<NotificationsResponse> => {
  try {
    if (!subscriberId) {
      throw new Error("No subscriber ID provided");
    }

    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unread_only: unread_only.toString(),
    });

    const response = await fetch(`${baseUrl}/notifications?${params}`, {
      method: "GET",
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `Backend API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Transform backend notifications to our format
    const notifications = (data.notifications || []).map(
      transformBackendNotification
    );

    return {
      success: true,
      notifications,
      total: data.total || notifications.length,
      unread_count:
        data.unread_count ||
        notifications.filter((n: Notification) => !n.isRead).length,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    Sentry.captureException(error);

    // Return empty state on error
    return {
      success: false,
      notifications: [],
      total: 0,
      unread_count: 0,
    };
  }
};

/**
 * Mark a notification as read via backend proxy
 * @param subscriberId - User's subscriber ID
 * @param notificationId - ID of the notification to mark as read
 * @returns Promise with action result
 */
export const markNotificationAsRead = async (
  subscriberId: string,
  notificationId: string
): Promise<NotificationActionResponse> => {
  try {
    if (!subscriberId) {
      throw new Error("No subscriber ID provided");
    }

    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(
      `${baseUrl}/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        credentials: "include",
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Backend API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      message: data.message || "Notification marked as read",
    };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    Sentry.captureException(error);

    return {
      success: false,
      message: "Failed to mark notification as read",
    };
  }
};

/**
 * Mark all notifications as read via backend proxy
 * @param subscriberId - User's subscriber ID
 * @returns Promise with action result
 */
export const markAllNotificationsAsRead = async (
  subscriberId: string
): Promise<NotificationActionResponse> => {
  try {
    if (!subscriberId) {
      throw new Error("No subscriber ID provided");
    }

    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(`${baseUrl}/notifications/mark-all-read`, {
      method: "POST",
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `Backend API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      message: data.message || "All notifications marked as read",
    };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    Sentry.captureException(error);

    return {
      success: false,
      message: "Failed to mark all notifications as read",
    };
  }
};

/**
 * Delete a notification via backend proxy
 * @param subscriberId - User's subscriber ID
 * @param notificationId - ID of the notification to delete
 * @returns Promise with action result
 */
export const deleteNotification = async (
  subscriberId: string,
  notificationId: string
): Promise<NotificationActionResponse> => {
  try {
    if (!subscriberId) {
      throw new Error("No subscriber ID provided");
    }

    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(`${baseUrl}/notifications/${notificationId}`, {
      method: "DELETE",
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `Backend API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      message: data.message || "Notification deleted",
    };
  } catch (error) {
    console.error("Error deleting notification:", error);
    Sentry.captureException(error);

    return {
      success: false,
      message: "Failed to delete notification",
    };
  }
};

/**
 * Get unread notification count via backend proxy
 * @param subscriberId - User's subscriber ID
 * @returns Promise with unread count
 */
export const getUnreadNotificationCount = async (
  subscriberId: string
): Promise<{ count: number }> => {
  try {
    if (!subscriberId) {
      throw new Error("No subscriber ID provided");
    }

    const baseUrl = import.meta.env.VITE_API_URL || "";
    const headers = getAuthHeaders();

    const response = await fetch(`${baseUrl}/notifications/unread-count`, {
      method: "GET",
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      throw new Error(
        `Backend API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      count: data.count || 0,
    };
  } catch (error) {
    console.error("Error fetching unread count:", error);
    Sentry.captureException(error);

    return { count: 0 };
  }
};
// test1
