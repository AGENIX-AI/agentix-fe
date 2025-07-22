import axiosInstance from "../axios-instance";

export interface HelpMainTopic {
  id: string;
  order: number;
  title: string;
  topics_count: number;
}

export interface HelpTopic {
  id: string;
  help_main_id: string;
  order: number;
  title: string;
  content: string;
}

export interface CreateHelpMainTopicRequest {
  order: number;
  title: string;
}

export interface UpdateHelpMainTopicRequest {
  order: number;
  title: string;
}

export interface CreateHelpTopicRequest {
  help_main_id: string;
  order: number;
  title: string;
  content: string;
}

export interface UpdateHelpTopicRequest {
  title: string;
  content: string;
}

// Help Main Topics API
export const fetchHelpMainTopics = async (): Promise<HelpMainTopic[]> => {
  const response = await axiosInstance.get("/systems/instructor/help_main");
  return response.data;
};

export const createHelpMainTopic = async (
  data: CreateHelpMainTopicRequest
): Promise<HelpMainTopic> => {
  const response = await axiosInstance.post(
    "/systems/instructor/help_main",
    data
  );
  return response.data;
};

export const updateHelpMainTopic = async (
  id: string,
  data: UpdateHelpMainTopicRequest
): Promise<HelpMainTopic> => {
  const response = await axiosInstance.put(
    `/systems/instructor/help_main/${id}`,
    data
  );
  return response.data;
};

export const deleteHelpMainTopic = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/systems/instructor/help_main/${id}`);
};

// Help Topics API
export const fetchHelpTopicsByMainId = async (
  mainId: string
): Promise<HelpTopic[]> => {
  const response = await axiosInstance.get(
    `/systems/instructor/help_topics/main/${mainId}`
  );
  return response.data;
};

export const fetchHelpTopic = async (id: string): Promise<HelpTopic> => {
  const response = await axiosInstance.get(
    `/systems/instructor/help_topics/${id}`
  );
  return response.data;
};

export const createHelpTopic = async (
  data: CreateHelpTopicRequest
): Promise<HelpTopic> => {
  const response = await axiosInstance.post(
    "/systems/instructor/help_topics",
    data
  );
  return response.data;
};

export const updateHelpTopic = async (
  id: string,
  data: UpdateHelpTopicRequest
): Promise<HelpTopic> => {
  const response = await axiosInstance.put(
    `/systems/instructor/help_topics/${id}`,
    data
  );
  return response.data;
};

export const deleteHelpTopic = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/systems/instructor/help_topics/${id}`);
};

// Reorder API
export const reorderHelpMainTopic = async (
  mainId: string,
  newOrder: number
): Promise<void> => {
  await axiosInstance.put("/systems/instructor/help_main/reorder", {
    main_id: mainId,
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
