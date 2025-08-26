import axiosInstance from "../axios-instance";

// Content block types
export interface ContentBlock {
  id: string;
  type:
    | "header"
    | "paragraph"
    | "list"
    | "code"
    | "table"
    | "image"
    | "quote"
    | "checklist"
    | "separator"
    | "url";
  data: Record<string, any>;
  order: number;
}

export interface HelpMainTopic {
  id: string;
  order: number;
  title: string;
  topics_count: number;
  type: string;
}

export interface HelpTopic {
  id: string;
  collection_id: string;
  order: number;
  title: string;
  content: ContentBlock[];
}

export interface CreateHelpMainTopicRequest {
  title: string;
  order: number;
  type: string;
}

export interface UpdateHelpMainTopicRequest {
  title?: string;
  order?: number;
}

export interface CreateHelpTopicRequest {
  title: string;
  collection_id: string;
  order: number;
  content: ContentBlock[];
}

export interface UpdateHelpTopicRequest {
  title?: string;
  collection_id?: string;
  order?: number;
  content?: ContentBlock[];
}

// API Response wrapper
interface ApiResponse<T> {
  data: T;
  message: string;
  status: string;
}

// Help Main Topics API
export const fetchHelpMainTopics = async (): Promise<HelpMainTopic[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<HelpMainTopic[]>>(
      "/systems/instructor/help_main"
    );
    // Handle both new API response format and direct array response
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data || [];
    }
    // Fallback for direct array response
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching instructor help main topics:", error);
    return [];
  }
};

export const createHelpMainTopic = async (
  data: CreateHelpMainTopicRequest
): Promise<HelpMainTopic> => {
  try {
    const response = await axiosInstance.post<ApiResponse<HelpMainTopic>>(
      "/systems/instructor/help_main",
      data
    );
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error("Error creating instructor help main topic:", error);
    throw error;
  }
};

export const updateHelpMainTopic = async (
  id: string,
  data: UpdateHelpMainTopicRequest
): Promise<HelpMainTopic> => {
  try {
    const response = await axiosInstance.put<ApiResponse<HelpMainTopic>>(
      `/systems/instructor/help_main/${id}`,
      data
    );
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error("Error updating instructor help main topic:", error);
    throw error;
  }
};

export const deleteHelpMainTopic = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/systems/instructor/help_main/${id}`);
  } catch (error) {
    console.error("Error deleting instructor help main topic:", error);
    throw error;
  }
};

// Help Topics API
export const fetchHelpTopicsByMainId = async (
  collectionId: string
): Promise<HelpTopic[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<HelpTopic[]>>(
      `/systems/instructor/help_topics/main/${collectionId}`
    );
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data || [];
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching instructor help topics by main ID:", error);
    return [];
  }
};

export const fetchHelpTopic = async (id: string): Promise<HelpTopic> => {
  try {
    const response = await axiosInstance.get<ApiResponse<HelpTopic>>(
      `/systems/instructor/help_topics/${id}`
    );
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching instructor help topic:", error);
    throw error;
  }
};

export const createHelpTopic = async (
  data: CreateHelpTopicRequest
): Promise<HelpTopic> => {
  try {
    const response = await axiosInstance.post<ApiResponse<HelpTopic>>(
      "/systems/instructor/help_topics",
      data
    );
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error("Error creating instructor help topic:", error);
    throw error;
  }
};

export const updateHelpTopic = async (
  id: string,
  data: UpdateHelpTopicRequest
): Promise<HelpTopic> => {
  try {
    const response = await axiosInstance.put<ApiResponse<HelpTopic>>(
      `/systems/instructor/help_topics/${id}`,
      data
    );
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error("Error updating instructor help topic:", error);
    throw error;
  }
};

export const deleteHelpTopic = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/systems/instructor/help_topics/${id}`);
  } catch (error) {
    console.error("Error deleting instructor help topic:", error);
    throw error;
  }
};

// Reorder API
export const reorderHelpMainTopic = async (
  collectionId: string,
  newOrder: number
): Promise<void> => {
  await axiosInstance.put("/systems/instructor/help_main/reorder", {
    collection_id: collectionId,
    new_order: newOrder,
  });
};

export const reorderHelpTopic = async (
  topicId: string,
  newOrder: number
): Promise<void> => {
  await axiosInstance.put("/systems/instructor/help_topics/reorder", {
    topic_id: topicId,
    new_order: newOrder,
  });
};
