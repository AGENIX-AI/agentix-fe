// Conversations API aligned with backend conversation_new under /conversations

import Cookies from "js-cookie";

// Auth headers helper
const getAuthHeaders = (): HeadersInit => {
  const accessToken = Cookies.get("agentix_access_token");
  const refreshToken = Cookies.get("agentix_refresh_token");
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  if (refreshToken) headers["X-Refresh-Token"] = refreshToken;
  return headers;
};

// DTOs (mirror backend app/conversation_new/application/dtos.py)
export interface CreateConversationRequest {
  workspace_id: string;
  type: string;
  title?: string;
  created_by_user?: string;
  participant_user_ids?: string[];
  participant_assistant_ids?: string[];
}

export interface ConversationResponseDTO {
  id: string;
  workspace_id: string;
  type: string;
  title?: string | null;
  created_by_user?: string | null;
}

export interface ConversationListResponseDTO {
  conversations: ConversationResponseDTO[];
  total_count: number;
  page_number: number;
  page_size: number;
}

export interface ConversationFilterParams {
  workspace_id: string;
  search?: string;
  page_number?: number;
  page_size?: number;
}

export interface ParticipantResponseDTO {
  conversation_id: string;
  user_id?: string | null;
  assistant_id?: string | null;
  is_moderator: boolean;
}

// Brief participant profile for avatars/names
export interface ParticipantBriefDTO {
  id: string;
  kind: "user" | "assistant";
  name?: string | null;
  image?: string | null;
}

// Minimal user and assistant info used by ChatComponent
export interface UserInfo {
  id: string;
  name?: string | null;
  image?: string | null;
}

export interface AssistantInfo {
  id: string;
  name?: string | null;
  image?: string | null;
  tagline?: string | null;
}

export interface AddParticipantRequest {
  conversation_id: string;
  user_id?: string;
  assistant_id?: string;
  is_moderator?: boolean;
}

export interface RemoveParticipantRequest {
  conversation_id: string;
  user_id?: string;
  assistant_id?: string;
}

export interface SendMessageRequestDTO {
  conversation_id: string;
  sender_user_id?: string;
  sender_assistant_id?: string;
  content: string;
  meta?: Record<string, any>;
}

export interface MessageResponseDTO {
  id: string;
  conversation_id: string;
  sender_user_id?: string | null;
  sender_assistant_id?: string | null;
  content: string;
  meta: Record<string, any>;
  created_at?: string; // ISO timestamp from backend
}

export interface MessageListResponseDTO {
  messages: MessageResponseDTO[];
  total_count: number;
  page_number: number;
  page_size: number;
}

const baseUrl = import.meta.env.VITE_API_URL || "";

// Conversations
export async function createConversation(
  data: CreateConversationRequest
): Promise<ConversationResponseDTO> {
  const res = await fetch(`${baseUrl}/conversations/`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
}

export async function getConversationById(
  conversationId: string
): Promise<ConversationResponseDTO> {
  const res = await fetch(
    `${baseUrl}/conversations/get_by_id/${conversationId}`,
    {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error("Failed to fetch conversation");
  return res.json();
}

export async function listConversations(
  params: ConversationFilterParams
): Promise<ConversationListResponseDTO> {
  const qs = new URLSearchParams();
  qs.set("workspace_id", params.workspace_id);
  if (params.search) qs.set("search", params.search);
  qs.set("page_number", String(params.page_number ?? 1));
  qs.set("page_size", String(params.page_size ?? 20));
  const res = await fetch(`${baseUrl}/conversations/?${qs.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to list conversations");
  return res.json();
}

// Participants
export async function addParticipant(
  data: AddParticipantRequest
): Promise<ParticipantResponseDTO> {
  const res = await fetch(`${baseUrl}/conversations/participants`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add participant");
  return res.json();
}

export async function removeParticipant(
  data: RemoveParticipantRequest
): Promise<{ success: boolean }> {
  const res = await fetch(`${baseUrl}/conversations/participants`, {
    method: "DELETE",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to remove participant");
  return res.json();
}

export async function listParticipants(
  conversationId: string
): Promise<ParticipantResponseDTO[]> {
  const res = await fetch(
    `${baseUrl}/conversations/participants/${conversationId}`,
    {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error("Failed to list participants");
  return res.json();
}

export async function listParticipantsBrief(
  conversationId: string
): Promise<ParticipantBriefDTO[]> {
  const res = await fetch(
    `${baseUrl}/conversations/participants/brief/${conversationId}`,
    {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error("Failed to list participant briefs");
  return res.json();
}

// Messages
// Legacy student chat send endpoint
export async function sendMessage(
  conversation_id: string,
  content: string,
  options?: { reply_to_message_id?: string }
): Promise<MessageResponseDTO> {
  const res = await fetch(`${baseUrl}/conversations/messages`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      conversation_id,
      content,
      meta: {},
      ...(options?.reply_to_message_id
        ? { reply_to_message_id: options.reply_to_message_id }
        : {}),
    }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
}

export async function listMessages(
  conversationId: string,
  page_number: number = 1,
  page_size: number = 50
): Promise<MessageListResponseDTO> {
  const qs = new URLSearchParams({
    page_number: String(page_number),
    page_size: String(page_size),
  });
  const res = await fetch(
    `${baseUrl}/conversations/messages/${conversationId}?${qs.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    }
  );
  if (!res.ok) throw new Error("Failed to list messages");
  return res.json();
}

export async function getConversationHistory(
  conversationId: string,
  page_number: number = 1,
  page_size: number = 50
): Promise<MessageListResponseDTO> {
  return listMessages(conversationId, page_number, page_size);
}

// Accept task list and create child conversations
export async function acceptTasks(params: {
  conversation_id: string;
  message_id: string;
  tasks: any[];
}): Promise<{ updated_message_id: string; created_children: any[] }> {
  const res = await fetch(`${baseUrl}/conversations/accept-tasks`, {
    method: "POST",
    credentials: "include",
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to accept tasks");
  return res.json();
}

// List child conversations for a parent
export async function listChildren(
  parentId: string
): Promise<Array<{ id: string; title?: string | null }>> {
  const res = await fetch(`${baseUrl}/conversations/children/${parentId}`, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to list child conversations");
  const data = await res.json();
  return (data || []).map((d: any) => ({ id: d.id, title: d.title }));
}

export async function uploadConversationImage(data: any): Promise<any> {
  return data;
}

export async function generateTutoringDiscuss(data: any): Promise<any> {
  return data;
}

export async function shareConversationWithInstructor(data: any): Promise<any> {
  return data;
}

export async function sendAchievement(data: any): Promise<any> {
  return data;
}

export async function createGenerateTask(data: any): Promise<any> {
  return data;
}

export async function refactorTutoringDiscuss(data: any): Promise<any> {
  return data;
}

export async function getSpeech(data: any): Promise<any> {
  return data;
}

export async function instructorCreateLearningDiscuss(data: any): Promise<any> {
  return data;
}
